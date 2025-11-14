import modelData from "../models/modelData.js";
// Normaliza para comparar sin mayúsculas/acentos/espacios extra
function normalize(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .trim();
}
export const getData = async (req, res) => {
  try {
    const data = await modelData.find();
    //console.log("📦 Documentos encontrados:", data.length);
    return res.status(200).json({
      allData: data.length,
      data,
    });
  } catch (err) {
    console.log("-Error getting data:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateData = async (req, res) => {
  try {
    //Validación de entrada
    const incoming = Array.isArray(req.body) ? req.body : [];
    if (incoming.length === 0) {
      return res
        .status(400)
        .json({ message: "Se esperaba un array con documentos" });
    }

    // 1) Preprocesar: agregar normalizedFront
    const prepped = incoming.map((d) => ({
      ...d,
      normalizedFront: normalize(d.front ?? ""),
    }));

    // 2) Eliminar duplicados dentro del payload
    const seen = new Set(); //Set no permite duplicados
    const uniquePayload = [];
    for (const d of prepped) {
      if (!d.normalizedFront) continue;
      if (!seen.has(d.normalizedFront)) {
        //.has pregunta si existe ya x
        seen.add(d.normalizedFront); //recordar que ya vimos el dato d.normalizedFront
        uniquePayload.push(d); //se agrega el obj al obj mayor
      }
    }

    if (uniquePayload.length === 0) {
      return res.status(200).json({
        inserted: 0,
        skipped: incoming.map((d) => d.front ?? ""),
        reason:
          "Todos los elementos del payload eran duplicados entre sí o inválidos",
      });
    }

    // 3) Buscar duplicados en la BD para ignorarlos
    const existing = await modelData
      .find(
        //esto devuelve solo lo que estaba repetido en la BD
        {
          //1 {este filtra qué documentos quiero buscar}
          normalizedFront: { $in: uniquePayload.map((d) => d.normalizedFront) },
          //$in: “dame los documentos cuya normalizedFront esté entre estos valores”
        },
        { normalizedFront: 1 /* front: 1 */ } //parametros que trae
        //el 1 es base, =solo tre ese campo
      )
      .lean();
    //No me des objetos mdb(pesados) dame objetos JavaScript(liviano)

    const existingKeys = new Set(existing.map((e) => e.normalizedFront));

    // 4) Separar los que se insertan de los que se saltan
    const toInsert = [];
    const skipped = [];
    for (const d of uniquePayload) {
      if (existingKeys.has(d.normalizedFront)) {
        skipped.push(d.front);
      } else {
        toInsert.push(d);
      }
    }

    // 5) Insertar
    let insertedCount = 0;
    if (toInsert.length > 0) {
      const inserted = await modelData.insertMany(toInsert, { ordered: false });
      insertedCount = inserted.length;
    }

    return res.status(200).json({
      inserted: insertedCount,
      skipped,
      message: "Carga completada (sin duplicados en front).",
    });
  } catch (err) {
    console.log("-Error updating data:", err);
    return res.status(500).json({ error: err.message });
  }
};

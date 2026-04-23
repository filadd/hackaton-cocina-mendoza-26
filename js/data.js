// Listado de provincias argentinas (para el mapa pixelado).
const PROVINCES = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

// Receta base pensada para 24 empanadas.
const RECIPE_EMPANADAS = {
  name: "Empanadas criollas de carne",
  base: 24,
  utensils: [
    "Tabla de madera",
    "Cuchillo filoso",
    "Olla mediana o sartén honda",
    "Bowl grande",
    "Cuchara de madera",
    "Pincel (si van al horno)",
    "Placa para horno o sartén para freír",
  ],
  ingredients: [
    // group, label, amount (for 24), unit, optional flags
    { group: "Relleno", label: "Carne vacuna (cortada a cuchillo)", qty: 1000, unit: "g" },
    { group: "Relleno", label: "Cebolla blanca", qty: 1000, unit: "g" },
    { group: "Relleno", label: "Cebolla de verdeo", qty: 3, unit: "unid." },
    { group: "Relleno", label: "Huevos duros", qty: 4, unit: "unid." },
    { group: "Relleno", label: "Aceitunas verdes sin carozo", qty: 100, unit: "g" },
    { group: "Relleno", label: "Pasas de uva", qty: 80, unit: "g", onlyIf: "raisins" },
    { group: "Relleno", label: "Grasa vacuna (o aceite)", qty: 100, unit: "g" },
    { group: "Condimentos", label: "Comino", qty: 1, unit: "cdita" },
    { group: "Condimentos", label: "Pimentón dulce", qty: 2, unit: "cdas" },
    { group: "Condimentos", label: "Ají molido", qty: 1, unit: "cdita" },
    { group: "Condimentos", label: "Sal", qty: 1, unit: "a gusto" },
    { group: "Condimentos", label: "Pimienta negra", qty: 1, unit: "a gusto" },
    { group: "Masa", label: "Tapas de empanada", qty: 24, unit: "unid.", celiacNote: "sin TACC" },
    { group: "Masa", label: "Huevo (para pincelar)", qty: 1, unit: "unid.", onlyIf: "horno" },
  ],
  steps: [
    {
      title: "Sofrito de cebolla",
      weight: 0.18,
      text: "Derretí la grasa en una olla y salteá la cebolla blanca bien picada a fuego bajo hasta que esté transparente.",
    },
    {
      title: "Sellado de la carne + condimentos",
      weight: 0.22,
      text: "Subí el fuego, sumá la carne cortada a cuchillo y condimentá con comino, pimentón, ají, sal y pimienta. Cociná hasta que cambie de color. Si queda seco, un chorrito de agua.",
    },
    {
      title: "Enfriar el relleno",
      weight: 0.10,
      text: "Apagá el fuego y agregá en crudo la parte verde del verdeo y los huevos duros picados. (Y las pasas, si elegiste.) Dejá enfriar en heladera — idealmente de un día para el otro.",
    },
    {
      title: "Armado y repulgue",
      weight: 0.30,
      text: "Mojá el borde de cada tapa, poné una cucharada de relleno frío, cerrá en media luna y hacé el repulgue pellizcando hacia adentro. Si no te sale, cerrá con tenedor.",
    },
    {
      title: "Cocción",
      weight: 0.20,
      text: "", // se completa según estilo
    },
  ],
  cookingByStyle: {
    horno: "Placa aceitada, pincelar con huevo y al horno fuerte (180–200°C) por 15–20 min hasta que estén doradas.",
    fritas: "Freír en abundante grasa vacuna o aceite bien caliente hasta que burbujeen y se doren.",
  },
};

// Comercios por provincia. Datos curados para 5 provincias con fallback genérico.
const STORES_BY_PROVINCE = {
  "Mendoza": [
    { name: "Carrefour Mendoza Shopping", type: "Supermercado", address: "Palmares Open Mall, Godoy Cruz", distance: "3.2 km", coords: "-32.9442,-68.8540", pick: "Tapas, aceitunas, pimentón y pasas — todo en un solo viaje." },
    { name: "Carnicería La Criolla", type: "Carnicería", address: "Av. San Martín 1200, Mendoza", distance: "1.1 km", coords: "-32.8893,-68.8458", pick: "Pedí bola de lomo y que te lo corten grueso para hacerlo a cuchillo." },
    { name: "Verdulería del Parque", type: "Verdulería", address: "Av. Boulogne Sur Mer 500", distance: "0.8 km", coords: "-32.8902,-68.8696", pick: "Cebolla blanca fresca y verdeo recién cortado." },
    { name: "Dia% Belgrano", type: "Autoservicio", address: "Belgrano 900, Mendoza", distance: "0.6 km", coords: "-32.8918,-68.8432", pick: "Económico para tapas Danal y condimentos básicos." },
    { name: "Vital Mayorista", type: "Mayorista", address: "Acceso Este km 6", distance: "7 km", coords: "-32.9066,-68.7862", pick: "Bulto cerrado de tapas y grasa vacuna si estás haciendo mucha cantidad." },
  ],
  "Córdoba": [
    { name: "Super Mami (Dino)", type: "Supermercado", address: "Av. Colón 4500, Córdoba", distance: "2.4 km", coords: "-31.4012,-64.2189", pick: "Acá están las tapas Ottonello económicas y muy rendidoras." },
    { name: "Hiper Libertad", type: "Hipermercado", address: "Av. Circunvalación y Fuerza Aérea", distance: "6 km", coords: "-31.4464,-64.2442", pick: "Packs familiares de La Salteña y ofertas de grasa vacuna." },
    { name: "Carnicería Don Ignacio", type: "Carnicería", address: "Bv. Chacabuco 800", distance: "1.5 km", coords: "-31.4280,-64.1900", pick: "Roast beef o bola de lomo cortado a cuchillo bajo pedido." },
    { name: "Maxiconsumo Córdoba", type: "Mayorista", address: "Av. Japón 1100", distance: "8 km", coords: "-31.3661,-64.2015", pick: "Il Bambino y Di Pascualle por bulto cerrado, precio rompedor." },
  ],
  "CABA": [
    { name: "Coto Caballito", type: "Supermercado", address: "Av. Rivadavia 5000, CABA", distance: "1.3 km", coords: "-34.6186,-58.4348", pick: "Todo lo que necesitás en un solo piso, incluida la pastelería con tapas." },
    { name: "Jumbo Palermo", type: "Hipermercado", address: "Bullrich 345, Palermo", distance: "3.1 km", coords: "-34.5720,-58.4253", pick: "La Salteña hojaldre y aceitunas importadas. Un poco más caro pero de mayor calidad." },
    { name: "Carnicería El Ternerito", type: "Carnicería", address: "Gorriti 4800, Palermo", distance: "2.0 km", coords: "-34.5905,-58.4315", pick: "Pedí carne 'para empanadas cortada a cuchillo'." },
    { name: "Diarco", type: "Mayorista", address: "Warnes 2707", distance: "4 km", coords: "-34.6016,-58.4674", pick: "Tapas y grasa por bulto, ideal si sos más de 10 comensales." },
  ],
  "Buenos Aires": [
    { name: "Carrefour La Plata", type: "Supermercado", address: "Av. 19 y 44, La Plata", distance: "2.5 km", coords: "-34.9167,-57.9530", pick: "Lo básico, tapas Danal y La Salteña." },
    { name: "Carnicería Don Ramón", type: "Carnicería", address: "Calle 12 y 60, La Plata", distance: "1.0 km", coords: "-34.9140,-57.9500", pick: "Nalga o bola de lomo. Pedí que lo corten fino para cuchillear." },
    { name: "Dia% Quilmes", type: "Autoservicio", address: "Rivadavia 200, Quilmes", distance: "0.7 km", coords: "-34.7210,-58.2528", pick: "Precio imbatible para condimentos." },
  ],
  "Salta": [
    { name: "Alberdi Supermercado", type: "Supermercado", address: "Alberdi 300, Salta", distance: "0.9 km", coords: "-24.7829,-65.4119", pick: "Tapas criollas sin hojaldre — como mandan acá." },
    { name: "Carnicería Güemes", type: "Carnicería", address: "Av. Belgrano 1100", distance: "1.3 km", coords: "-24.7910,-65.4060", pick: "Pedí roast beef y grasa de pella — clave para la empanada salteña." },
    { name: "Mercado San Miguel", type: "Mercado", address: "Calle Ituzaingó 858", distance: "0.5 km", coords: "-24.7950,-65.4100", pick: "Pasas de uva, pimentón ahumado y ají molido del norte." },
  ],
};

const FALLBACK_STORES = [
  { name: "Súper de barrio", type: "Supermercado", address: "Tu barrio", distance: "—", coords: "", pick: "Para tapas Danal o La Salteña y condimentos." },
  { name: "Carnicería cercana", type: "Carnicería", address: "Tu barrio", distance: "—", coords: "", pick: "Pedí bola de lomo o nalga para cortar a cuchillo." },
  { name: "Verdulería del barrio", type: "Verdulería", address: "Tu barrio", distance: "—", coords: "", pick: "Cebolla blanca, verdeo y huevos frescos." },
];

// Marcas de tapas. presence[provincia] = "⭐ recomendada en tu zona" | "disponible" | "limitada".
const TAPAS_BRANDS = [
  {
    brand: "La Salteña",
    variant: "Horno/hojaldre · 12 u.",
    price: "$2.600 – $2.800",
    where: "Jumbo, Disco, Carrefour (todo el país)",
    badge: "Top tier: no se pegan, hojaldre bien definido.",
    presence: { "CABA": "star", "Buenos Aires": "star", "Mendoza": "ok", "Córdoba": "ok", "Salta": "ok" },
  },
  {
    brand: "La Salteña",
    variant: "Pack familiar · 22 u.",
    price: "$3.600 – $3.900",
    where: "Hipermercados grandes",
    badge: "Conveniencia si hacés muchas.",
    presence: { "CABA": "ok", "Buenos Aires": "ok", "Mendoza": "ok", "Córdoba": "ok" },
  },
  {
    brand: "Danal",
    variant: "Comunes · 12 u.",
    price: "$1.300 – $1.500",
    where: "Autoservicios, chinos, Rappi",
    badge: "Precio medio, muy rendidoras.",
    presence: { "CABA": "ok", "Buenos Aires": "ok", "Mendoza": "ok", "Córdoba": "ok", "Salta": "ok" },
  },
  {
    brand: "Danal",
    variant: "Árabes · 12 u.",
    price: "~$2.000",
    where: "Almacenes de barrio, súper regionales",
    badge: "Para freír: salen crocantes.",
    presence: { "CABA": "ok", "Buenos Aires": "ok", "Mendoza": "ok", "Córdoba": "ok" },
  },
  {
    brand: "Ottonello",
    variant: "Horno/freír · 12 u.",
    price: "$1.100 – $1.400",
    where: "Córdoba: Super Mami (Dino), Hiper Libertad, mayoristas",
    badge: "Económica, ideal peñas/reuniones.",
    presence: { "Córdoba": "star", "Mendoza": "ok", "Buenos Aires": "limited" },
  },
  {
    brand: "Il Bambino / Di Pascualle",
    variant: "Comunes · mayorista",
    price: "desde $1.150",
    where: "Maxiconsumo, Vital, Diarco (pack cerrado)",
    badge: "Precio más bajo si comprás en cantidad.",
    presence: { "CABA": "ok", "Buenos Aires": "ok", "Córdoba": "ok", "Mendoza": "ok" },
  },
];

function storesForProvince(province) {
  return STORES_BY_PROVINCE[province] || FALLBACK_STORES;
}

function brandsForProvince(province) {
  // Orden: primero las que tienen "star" en esta provincia, después "ok", después el resto.
  const rank = (b) => {
    const p = b.presence[province];
    if (p === "star") return 0;
    if (p === "ok") return 1;
    if (p === "limited") return 2;
    return 3;
  };
  return [...TAPAS_BRANDS].sort((a, b) => rank(a) - rank(b));
}

// Cortes y tips según habilidad.
const MEAT_CUTS = {
  basico:     { cut: "Bola de lomo", note: "Fácil de cortar, sabor parejo. Pedí que la corten en fetas gruesas y vos la picás a cuchillo en casa." },
  intermedio: { cut: "Nalga",        note: "Un poco más firme, muy sabrosa. Cortala en cubitos chicos." },
  avanzado:   { cut: "Roast beef",   note: "Cortado a cuchillo en cubitos de 5 mm — el corte criollo clásico. Pedí asesoramiento al carnicero." },
};

// Tip de mayorista por provincia.
const WHOLESALE_TIPS = {
  "Mendoza":  "En Vital Mayorista podés sacar grasa vacuna y tapas por bulto con hasta 20% menos.",
  "Córdoba":  "Maxiconsumo tiene Il Bambino y Ottonello por bulto cerrado, descuentos desde 15%.",
  "CABA":     "Diarco en Warnes: tapas y aceitunas por bulto, ideal reuniones grandes.",
  "Buenos Aires": "Maxiconsumo del conurbano (Avellaneda, Lomas, Morón) con descuentos por bulto.",
  "Salta":    "Mercado San Miguel: especias del norte a precio de mercado, no de súper.",
};

// ---------- Lunfardo por región ----------
// Cada provincia se agrupa en una región con modismos distintos. Si la región
// no tiene la frase específica, se cae al default.
const REGION_BY_PROVINCE = {
  "Buenos Aires": "pampa", "CABA": "pampa", "Santa Fe": "pampa",
  "Entre Ríos": "pampa", "La Pampa": "pampa",
  "Córdoba": "cordoba",
  "Mendoza": "cuyo", "San Juan": "cuyo", "San Luis": "cuyo",
  "Jujuy": "noa", "Salta": "noa", "Tucumán": "noa",
  "Catamarca": "noa", "La Rioja": "noa", "Santiago del Estero": "noa",
  "Corrientes": "litoral", "Misiones": "litoral",
  "Formosa": "litoral", "Chaco": "litoral",
  "Neuquén": "patagonia", "Río Negro": "patagonia",
  "Chubut": "patagonia", "Santa Cruz": "patagonia", "Tierra del Fuego": "patagonia",
};

function regionForProvince(prov) {
  return REGION_BY_PROVINCE[prov] || "pampa";
}

// Modismos por región. La frase intermedia de done mantiene el guiño
// "La abuela estaría orgullosa" — pedido explícito.
const LINGO_BY_REGION = {
  pampa: {
    kitchen: {
      basico:     "Dale campeón/a, arrancamos tranqui. Ni en pedo te apures.",
      intermedio: "Bien ahí, posta. Mano firme con el cuchillo y paciencia con el repulgue.",
      avanzado:   "Hora de lucirse, maestro/a. Corte parejo, pino jugoso, repulgue de 10.",
    },
    done: {
      basico:     "¡Primer lote al horno, posta! Ya sos un poco más argentino/a.",
      intermedio: "Bien ahí, posta. La abuela estaría orgullosa.",
      avanzado:   "Obra de arte, de 10. Mandale foto a los pibes y a las chicas.",
    },
    vendor: {
      carniceria: "¿Qué le doy, jefe/a?",
      verduleria: "¡Bárbaro! Todo fresquito de esta mañana. ¿Qué lleva?",
      almacen:    "Tengo de todo, posta. ¿Qué precisás?",
    },
  },
  cordoba: {
    kitchen: {
      basico:     "Tranqui, negro/a. Despacito. Respirá.",
      intermedio: "Bien ahí, negro/a. Mano firme y paciencia con el repulgue, ¡viste!",
      avanzado:   "De una, maestro/a. A sacarla barata con repulgue prolijo.",
    },
    done: {
      basico:     "¡Primer round! Ya tenés pasaporte al fernet con empanadas.",
      intermedio: "De 10, negro/a. La abuela estaría orgullosa.",
      avanzado:   "¡Epa! Joya, ¿viste? Subile a las redes.",
    },
    vendor: {
      carniceria: "¡Epa! ¿Qué llevás hoy?",
      verduleria: "Todo fresquito, negro/a. ¿Qué buscás?",
      almacen:    "Sentate tranqui, acá hay de todo.",
    },
  },
  cuyo: {
    kitchen: {
      basico:     "Dale nomás, tranqui. Ni en pedo te apures.",
      intermedio: "Qué hacé, bo. Mano firme con el cuchillo y paciencia.",
      avanzado:   "A sacarla, che. Corte a cuchillo parejo y repulgue prolijo.",
    },
    done: {
      basico:     "¡Primer tanda lista, bo! Ya sos un poco más cuyano/a.",
      intermedio: "Bien ahí, cuyano/a. La abuela estaría orgullosa.",
      avanzado:   "Joyita, che. Ahora a acompañar con un Malbec.",
    },
    vendor: {
      carniceria: "Buenas, bo. ¿Qué le doy?",
      verduleria: "Todo fresquito de la finca, recién cosechado. ¿Qué precisa?",
      almacen:    "Tengo todo lo que precise, don/doña.",
    },
  },
  noa: {
    kitchen: {
      basico:     "Despacito, chango/a. Ni en pedo te apures.",
      intermedio: "Joyita. Mano firme con el cuchillo, mirá vos.",
      avanzado:   "Hermoso chango/a. Que salgan como las de allá, salteñas de verdad.",
    },
    done: {
      basico:     "¡Tu primera tanda, chango/a! Ya sos un poco más del norte.",
      intermedio: "Joyita, guay. La abuela estaría orgullosa.",
      avanzado:   "¡Mira vos! Obra de arte, chango/a. Subile a las redes.",
    },
    vendor: {
      carniceria: "Buenas, chango/a. ¿Qué va a llevar?",
      verduleria: "Todo del valle, recién traído. ¿Qué le busco?",
      almacen:    "Le tengo de todo, guay. ¿Qué precisa?",
    },
  },
  litoral: {
    kitchen: {
      basico:     "Tranqui, che. Ni en pedo te apures.",
      intermedio: "Mirá vos. Mano firme con el cuchillo, paciencia con el repulgue.",
      avanzado:   "De una, che. Corte parejo, pino jugoso.",
    },
    done: {
      basico:     "¡Primer tanda! Ya entrás al club.",
      intermedio: "Bárbaro, che. La abuela estaría orgullosa.",
      avanzado:   "Joya. Mandale foto a los primos de Paraguay.",
    },
    vendor: {
      carniceria: "¿Qué llevás, che?",
      verduleria: "¡Todo fresquito! ¿Qué buscás?",
      almacen:    "Le tengo de todo, don/doña.",
    },
  },
  patagonia: {
    kitchen: {
      basico:     "Dale tranqui, che. Ni en pedo te apures.",
      intermedio: "De una. Mano firme con el cuchillo y paciencia.",
      avanzado:   "A sacarla, maestro/a. Corte parejo y repulgue al toque.",
    },
    done: {
      basico:     "¡Primer lote! Ya sos del sur, che.",
      intermedio: "De una, che. La abuela estaría orgullosa.",
      avanzado:   "Impecable. Mandale foto a los del norte para que aprendan.",
    },
    vendor: {
      carniceria: "¿Qué le doy, che?",
      verduleria: "Todo lo del día, che. ¿Qué precisa?",
      almacen:    "Acá hay de todo, pasale tranqui.",
    },
  },
};

// Getters con fallback a pampa (default) si la región no tiene la frase.
function kitchenVibe(province, skill) {
  const reg = LINGO_BY_REGION[regionForProvince(province)] || LINGO_BY_REGION.pampa;
  return (reg.kitchen && reg.kitchen[skill]) || LINGO_BY_REGION.pampa.kitchen[skill] || "¡A cocinar!";
}
function doneVibe(province, skill) {
  const reg = LINGO_BY_REGION[regionForProvince(province)] || LINGO_BY_REGION.pampa;
  return (reg.done && reg.done[skill]) || LINGO_BY_REGION.pampa.done[skill] || "";
}
function vendorLine(province, shopId) {
  const reg = LINGO_BY_REGION[regionForProvince(province)] || LINGO_BY_REGION.pampa;
  return (reg.vendor && reg.vendor[shopId]) || LINGO_BY_REGION.pampa.vendor[shopId] || "";
}

// Comercios para agrupar la lista de compras. Cada uno sabe qué
// ingredientes vende (match por label con RECIPE_EMPANADAS.ingredients).
const SHOPS = [
  {
    id: "carniceria",
    name: "Carnicería",
    title: "Carnicería El Facón",
    bg: "assets/carnage.png",
    vendor: "Carnicero",
    dialog: "Buenas, ¿qué le doy hoy?",
    icon: "ing-carne",
    ingredients: [
      "Carne vacuna (cortada a cuchillo)",
      "Grasa vacuna (o aceite)",
    ],
  },
  {
    id: "verduleria",
    name: "Verdulería",
    title: "Verdulería El Campo",
    bg: "assets/greengrocery.png",
    vendor: "Verdulero",
    dialog: "¡Todo fresquito de esta mañana! ¿Qué lleva?",
    icon: "ing-verdeo",
    ingredients: [
      "Cebolla blanca",
      "Cebolla de verdeo",
      "Huevos duros",
      "Huevo (para pincelar)",
    ],
  },
  {
    id: "almacen",
    name: "Almacén",
    title: "Pulpería · Almacén de campo",
    bg: "assets/kitchen.png",
    vendor: "Almacenero",
    dialog: "Tengo de todo, don. ¿Qué precisa?",
    icon: "ing-tapas",
    ingredients: [
      "Aceitunas verdes sin carozo",
      "Pasas de uva",
      "Tapas de empanada",
      "Comino",
      "Pimentón dulce",
      "Ají molido",
      "Sal",
      "Pimienta negra",
    ],
  },
];

function shopForIngredient(label) {
  return SHOPS.find((s) => s.ingredients.includes(label)) || null;
}

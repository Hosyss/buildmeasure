export type CalculatorCatalogGroup =
  | "Concrete & foundations"
  | "Interiors & finishes"
  | "Masonry & landscape";

export type CalculatorCatalogItem = {
  id: string;
  group: CalculatorCatalogGroup;
  family: string;
  name: string;
  shortName: string;
  description: string;
  useWhen: string;
  verifyBeforeOrdering: string;
  href: string;
  guideHref: string;
  keywords: readonly string[];
  featured?: boolean;
};

export const CALCULATOR_CATALOG: readonly CalculatorCatalogItem[] = [
  {
    id: "concrete-project",
    group: "Concrete & foundations",
    family: "Concrete project",
    name: "Multi-Shape Concrete Project Calculator",
    shortName: "Multi-Shape Concrete",
    description: "Combine slabs, circular pours, footings, columns, walls, and post holes into one auditable concrete order.",
    useWhen: "One concrete order contains several supported shapes and you want one allowance and one final bag-rounding step.",
    verifyBeforeOrdering: "Confirm every part uses the intended dimensions and that the supplier order increment matches the final combined quantity.",
    href: "/concrete-project-calculator",
    guideHref: "/guides/how-to-estimate-multi-shape-concrete-project",
    keywords: ["concrete", "project", "multi shape", "mixed geometry", "bags", "ready mix"],
    featured: true,
  },
  {
    id: "concrete",
    group: "Concrete & foundations",
    family: "Slabs",
    name: "Concrete Calculator",
    shortName: "Rectangular Concrete",
    description: "Rectangular slab volume, allowance, ready-mix quantity, and complete concrete bags.",
    useWhen: "The pour is a rectangular slab, pad, or section with one measured length, width, and thickness.",
    verifyBeforeOrdering: "Recheck formed dimensions, thickness, waste allowance, and the exact bag yield or ready-mix ordering rule.",
    href: "/concrete-calculator",
    guideHref: "/guides/how-many-bags-of-concrete",
    keywords: ["concrete", "slab", "patio", "pad", "bags", "cubic yards"],
    featured: true,
  },
  {
    id: "circular-slab",
    group: "Concrete & foundations",
    family: "Slabs",
    name: "Circular Slab Concrete Calculator",
    shortName: "Circular Slab",
    description: "Circular slabs and pads from measured diameter, depth, quantity, and allowance.",
    useWhen: "The pour is circular and you know the measured diameter, thickness, and number of identical slabs or pads.",
    verifyBeforeOrdering: "Use the actual diameter rather than circumference and confirm the final formed depth before applying allowance.",
    href: "/circular-slab-calculator",
    guideHref: "/guides/how-much-concrete-for-circular-slabs",
    keywords: ["concrete", "circle", "circular slab", "diameter", "round pad"],
  },
  {
    id: "footing",
    group: "Concrete & foundations",
    family: "Foundations",
    name: "Footing Concrete Calculator",
    shortName: "Footings",
    description: "Identical rectangular footing volume with explicit allowance and final-project bag rounding.",
    useWhen: "You are estimating the material quantity for measured rectangular footings of the same size.",
    verifyBeforeOrdering: "Footing dimensions must come from approved plans or a qualified project professional; this tool does not size foundations.",
    href: "/footing-calculator",
    guideHref: "/guides/how-much-concrete-for-footings",
    keywords: ["concrete", "footing", "foundation", "strip footing", "bags"],
  },
  {
    id: "column",
    group: "Concrete & foundations",
    family: "Structure",
    name: "Column Concrete Calculator",
    shortName: "Columns",
    description: "Square, rectangular, or circular column quantity from actual measured dimensions.",
    useWhen: "Column geometry and dimensions are already specified and you only need concrete volume and purchase quantity.",
    verifyBeforeOrdering: "Confirm the structural dimensions, shape, quantity, and any embedded or displaced volume required by the project documents.",
    href: "/column-calculator",
    guideHref: "/guides/how-much-concrete-for-columns",
    keywords: ["concrete", "column", "pillar", "round column", "square column"],
  },
  {
    id: "wall",
    group: "Concrete & foundations",
    family: "Structure",
    name: "Concrete Wall Calculator",
    shortName: "Concrete Walls",
    description: "Concrete walls with measured full-depth opening subtraction before volume calculation.",
    useWhen: "Wall length, height, thickness, and any full-depth openings are already measured or specified.",
    verifyBeforeOrdering: "Only subtract openings that truly remove the full wall thickness, and confirm structural thickness from the project design.",
    href: "/wall-calculator",
    guideHref: "/guides/how-much-concrete-for-walls",
    keywords: ["concrete", "wall", "openings", "forms", "volume"],
  },
  {
    id: "post-hole",
    group: "Concrete & foundations",
    family: "Posts & fences",
    name: "Post Hole Concrete Calculator",
    shortName: "Post Holes",
    description: "Round post holes, multiple-hole quantity, and optional round or square post displacement.",
    useWhen: "You know the measured hole diameter and depth and need concrete for one or more identical round post holes.",
    verifyBeforeOrdering: "Confirm required hole dimensions locally and include post displacement only when the post occupies the modeled concrete volume.",
    href: "/post-hole-concrete-calculator",
    guideHref: "/guides/how-many-bags-of-concrete-for-post-holes",
    keywords: ["concrete", "post hole", "fence", "deck", "pole", "bags"],
  },
  {
    id: "paint",
    group: "Interiors & finishes",
    family: "Paint",
    name: "Paint Calculator",
    shortName: "Paint",
    description: "Room walls and ceilings using measured openings, coats, product coverage, and containers.",
    useWhen: "You can measure wall and ceiling area, openings, number of coats, and the coverage printed for the paint you plan to use.",
    verifyBeforeOrdering: "Check the current product label because texture, porosity, application method, color change, and primer can change real coverage.",
    href: "/paint-calculator",
    guideHref: "/guides/how-much-paint-do-i-need",
    keywords: ["paint", "room", "walls", "ceiling", "gallons", "liters"],
    featured: true,
  },
  {
    id: "tile",
    group: "Interiors & finishes",
    family: "Flooring",
    name: "Tile Calculator",
    shortName: "Tile",
    description: "Tile quantity, complete boxes, layout dimensions, grout spacing, and cutting allowance.",
    useWhen: "The tiled area, tile dimensions, grout spacing, box quantity, and cutting allowance are known.",
    verifyBeforeOrdering: "Confirm the actual box count and batch availability; patterns, diagonal layouts, breakage, and attic stock may require more material.",
    href: "/tile-calculator",
    guideHref: "/guides/how-many-tiles-do-i-need",
    keywords: ["tile", "floor", "wall tile", "boxes", "grout", "layout"],
    featured: true,
  },
  {
    id: "drywall",
    group: "Interiors & finishes",
    family: "Interior walls",
    name: "Drywall Calculator",
    shortName: "Drywall",
    description: "Room walls, optional ceiling, measured openings, panel size, allowance, and complete sheets.",
    useWhen: "You know the room dimensions, openings, whether the ceiling is included, and the sheet size you intend to buy.",
    verifyBeforeOrdering: "Panel layout, fire or moisture rating, local requirements, and offcut reuse are project decisions beyond a simple area estimate.",
    href: "/drywall-calculator",
    guideHref: "/guides/how-many-drywall-sheets-do-i-need",
    keywords: ["drywall", "sheetrock", "gypsum", "panels", "sheets", "walls"],
  },
  {
    id: "brick",
    group: "Masonry & landscape",
    family: "Masonry",
    name: "Brick Calculator",
    shortName: "Brick",
    description: "Net wall area, measured openings, documented coverage, and explicit breakage allowance.",
    useWhen: "You know the net wall area and have a documented brick coverage rate for the selected unit and mortar joint.",
    verifyBeforeOrdering: "Use the supplier or manufacturer coverage for the exact brick and joint; wall thickness, bond, cuts, and breakage affect the order.",
    href: "/brick-calculator",
    guideHref: "/guides/how-many-bricks-do-i-need",
    keywords: ["brick", "masonry", "wall", "BIA", "breakage"],
    featured: true,
  },
  {
    id: "gravel",
    group: "Masonry & landscape",
    family: "Landscape",
    name: "Gravel Calculator",
    shortName: "Gravel",
    description: "Layer volume, adjustable density, total weight, tons or tonnes, and complete bags.",
    useWhen: "You can measure the coverage area and installed depth and have a reasonable density for the actual gravel product and condition.",
    verifyBeforeOrdering: "Supplier density, moisture, compaction, subgrade variation, and delivery increments can materially change the purchased tonnage.",
    href: "/gravel-calculator",
    guideHref: "/guides/how-much-gravel-do-i-need",
    keywords: ["gravel", "driveway", "stone", "tons", "tonnes", "density"],
    featured: true,
  },
  {
    id: "mulch",
    group: "Masonry & landscape",
    family: "Landscape",
    name: "Mulch Calculator",
    shortName: "Mulch",
    description: "Garden-bed volume, installed depth, bulk cubic yards, and complete package quantities.",
    useWhen: "You know the bed area, target installed depth, and either the bulk ordering unit or exact bag volume.",
    verifyBeforeOrdering: "Check the package volume and supplier unit; settling, irregular bed edges, and existing mulch depth affect the practical quantity.",
    href: "/mulch-calculator",
    guideHref: "/guides/how-much-mulch-do-i-need",
    keywords: ["mulch", "garden", "landscape", "beds", "cubic yards", "bags"],
  },
] as const;

export const CALCULATOR_GROUPS: readonly CalculatorCatalogGroup[] = [
  "Concrete & foundations",
  "Interiors & finishes",
  "Masonry & landscape",
];

export const LIVE_CALCULATOR_COUNT = CALCULATOR_CATALOG.length;

export function calculatorSearchText(calculator: CalculatorCatalogItem) {
  return [
    calculator.name,
    calculator.shortName,
    calculator.group,
    calculator.family,
    calculator.description,
    calculator.useWhen,
    calculator.verifyBeforeOrdering,
    ...calculator.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

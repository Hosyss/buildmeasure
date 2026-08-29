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
    ...calculator.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

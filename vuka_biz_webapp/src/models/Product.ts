import type { IconName } from '@/components/ui/Icon';

import { Money } from './Money';

export type ProductCategoryId = 'produce' | 'bakery' | 'groceries' | 'drinks';

export class ProductCategory {
  constructor(
    readonly id: ProductCategoryId,
    readonly label: string,
    readonly icon: IconName,
  ) {}
}

export type Tone = 'brand' | 'accent' | 'amber' | 'neutral' | 'danger';

export interface ProductTag {
  label: string;
  tone: Tone;
}

export interface ProductProps {
  id: string;
  name: string;
  supplier: string;
  category: ProductCategoryId;
  packLabel: string;
  unitNote: string;
  price: number;
  weightKg: number;
  sourceTag: ProductTag;
  highlight: ProductTag;
  footnote: { label: string; icon?: IconName; tone: Tone };
  icon: IconName;
  imageUrl?: string;
}

export class Product {
  readonly id: string;
  readonly name: string;
  readonly supplier: string;
  readonly category: ProductCategoryId;
  readonly packLabel: string;
  readonly unitNote: string;
  readonly price: Money;
  readonly weightKg: number;
  readonly sourceTag: ProductTag;
  readonly highlight: ProductTag;
  readonly footnote: ProductProps['footnote'];
  readonly icon: IconName;
  readonly imageUrl?: string;

  constructor(props: ProductProps) {
    this.id = props.id;
    this.name = props.name;
    this.supplier = props.supplier;
    this.category = props.category;
    this.packLabel = props.packLabel;
    this.unitNote = props.unitNote;
    this.price = Money.of(props.price);
    this.weightKg = props.weightKg;
    this.sourceTag = props.sourceTag;
    this.highlight = props.highlight;
    this.footnote = props.footnote;
    this.icon = props.icon;
    this.imageUrl = props.imageUrl;
  }

  matches(query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [this.name, this.supplier, this.unitNote].some((field) =>
      field.toLowerCase().includes(q),
    );
  }
}

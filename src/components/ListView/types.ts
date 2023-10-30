export type ListViewItem = Record<string, any> & { id: string | number };

export type ListViewSection<T extends ListViewItem> = {
  id: string | number;
  items: T[];
} & Record<string, any>;

export type FlatItem<T extends ListViewItem> = (
  | {
      type: 'header';
    }
  | {
      type: 'footer';
    }
  | {
      type: 'item';
      item: T;
      itemIndex: number;
    }
  | {
      type: 'empty';
    }
) & { id: string };

export type SectionContext<T extends ListViewItem> = {
  section: ListViewSection<T>;
  sectionIndex: number;
};

export type ItemContext<T extends ListViewItem> = SectionContext<T> & {
  item: T;
  itemIndex: number;
};

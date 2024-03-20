import React, { ReactNode, memo, useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, View } from 'react-native';

import { ListViewItem as ListItem } from './ListViewItem';
import type {
  ListViewSection,
  ListViewItem,
  ItemContext,
  SectionContext,
  FlatItem,
} from './types';

type SectionSize<T extends ListViewItem> =
  | number
  | ((context: SectionContext<T>) => number);

export type ListViewProps<T extends ListViewItem> = (
  | { sections: ListViewSection<T>[]; items?: T[] }
  | { sections?: ListViewSection<T>[]; items: T[] }
) & {
  itemSize: number | ((context: ItemContext<T>) => number);
  renderItem: (context: ItemContext<T>) => ReactNode;
  numColumns?: number;
  spacing?: number;
  sectionHeader?: {
    size: SectionSize<T>;
    renderHeader?: (context: SectionContext<T>) => ReactNode;
  };
  sectionFooter?: {
    size: SectionSize<T>;
    renderFooter?: (context: SectionContext<T>) => ReactNode;
  };
  style?: FlatListProps<T>['style'];
  flatListProps?: Partial<FlatListProps<T>>;
};

export type ListViewLayoutProps<T extends ListViewItem = ListViewItem> = Pick<
  ListViewProps<T>,
  'spacing' | 'itemSize' | 'numColumns'
> & {
  sectionHeaderSize?: SectionSize<T>;
  sectionFooterSize?: SectionSize<T>;
  wrapperTotalPaddingSize:
    | ((
        props: ListViewLayoutProps<T> &
          Pick<ListViewProps<T>, 'items' | 'sections'>,
      ) => number)
    | number;
  wrapperTotalBorderSize:
    | ((
        props: ListViewLayoutProps<T> &
          Pick<ListViewProps<T>, 'items' | 'sections'>,
      ) => number)
    | number;
};

function groupItems<T extends ListViewItem>({
  sections,
  numColumns = 1,
  sectionHeader,
  sectionFooter,
  itemSize,
  spacing = 0,
}: ListViewProps<T>) {
  let currentOffset = 0;

  const flattenSection = (
    { items: sectionItems, ...section }: ListViewSection<T>,
    sectionIdx: number,
  ): FlatItem<T>[] => [
    ...(sectionHeader
      ? [
          {
            type: 'header',
            id: `${section.id ?? sectionIdx}_header`,
          },
        ]
      : []),
    ...sectionItems.map(
      (item, itemIndex) =>
        ({
          type: 'item' as const,
          item,
          itemIndex,
          id: item.id ?? itemIndex,
        } as any),
    ),
    ...[
      ...new Array(
        sectionItems.length % numColumns === 0
          ? 0
          : numColumns - (sectionItems.length % numColumns),
      ).keys(),
    ].map((idx) => ({
      type: 'empty' as const,
      id: `${section.id ?? sectionIdx}_empty_${idx}`,
    })),
    ...(sectionFooter
      ? [
          {
            type: 'footer',
            id: `${section.id ?? sectionIdx}_footer`,
          },
        ]
      : []),
  ];

  const groupItems = (
    flatItems: FlatItem<T>[],
    section: ListViewSection<T>,
    sectionIndex: number,
  ) => {
    const groupedItems: ({
      id: string;
      section: ListViewSection<T>;
      sectionIndex: number;
      layout: { length: number; offset: number };
    } & (
      | {
          type: 'header' | 'footer';
        }
      | {
          type: 'group';
          items: FlatItem<T>[];
        }
    ))[] = [];
    let currentGroup: FlatItem<T>[] = [];
    let groupIndex = 0;

    const wrapGroup = () => {
      const size = (() => {
        if (typeof itemSize === 'function') {
          return Math.max(
            ...currentGroup
              .filter((x) => x.type === 'item')
              .map((x) => {
                const { item, itemIndex } = x as FlatItem<T> & { type: 'item' };

                return itemSize({
                  sectionIndex,
                  section,
                  itemIndex,
                  item: item as any,
                });
              }),
          );
        } else {
          return itemSize;
        }
      })();

      groupedItems.push({
        id: `${section.id ?? sectionIndex}_group_${groupIndex}`,
        type: 'group',
        section,
        sectionIndex,
        items: currentGroup,
        layout: { length: size, offset: currentOffset },
      });

      currentGroup = [];
      currentOffset += size;
      currentOffset += spacing;
      groupIndex += 1;
    };

    for (let i = 0; i < flatItems.length; i++) {
      const item = flatItems[i];

      if (item.type === 'header') {
        const size =
          typeof sectionHeader!.size === 'number'
            ? sectionHeader!.size
            : sectionHeader!.size({
                sectionIndex,
                section,
              });

        groupedItems.push({
          ...item,
          section,
          sectionIndex,
          layout: { length: size, offset: currentOffset },
        });
        currentGroup = [];
        currentOffset += size;
        currentOffset += spacing;

        continue;
      }

      if (item.type === 'footer') {
        const size =
          typeof sectionFooter!.size === 'number'
            ? sectionFooter!.size
            : sectionFooter!.size({
                sectionIndex,
                section,
              });

        groupedItems.push({
          ...item,
          section,
          sectionIndex,
          layout: { length: size, offset: currentOffset },
        });
        currentGroup = [];
        currentOffset += size;
        currentOffset += spacing;

        continue;
      }

      if (currentGroup.length === numColumns - 1) {
        currentGroup.push(item);

        wrapGroup();

        // eslint-disable-next-line no-continue
        continue;
      }

      currentGroup.push(item);
    }

    if (currentGroup.length) {
      wrapGroup();
    }

    return groupedItems;
  };

  const allGroups: ReturnType<typeof groupItems> = [];
  sections!.forEach((section, sectionIdx) => {
    const flatSections = flattenSection(section, sectionIdx);
    const groups = groupItems(flatSections, section, sectionIdx);
    allGroups.push(...groups);
  });

  return allGroups;
}

function ListViewInner<T extends ListViewItem = ListViewItem>({
  sections: passedSections,
  items: passedItems,
  itemSize,
  spacing = 0,
  numColumns = 1,
  sectionHeader,
  sectionFooter,
  flatListProps,
  style,
  renderItem: renderContent,
}: ListViewProps<T>) {
  const sections = useMemo<ListViewSection<T>[]>(() => {
    if (passedSections) {
      return passedSections;
    }

    return [{ id: '0', items: passedItems! }];
  }, [passedItems, passedSections]);

  const items = useMemo(() => {
    return groupItems({
      sections,
      numColumns,
      spacing,
      sectionFooter,
      sectionHeader,
      itemSize,
    } as any);
  }, [sections, numColumns, spacing]);

  const getItemLayout = useCallback<
    NonNullable<FlatListProps<(typeof items)[number]>['getItemLayout']>
  >(
    (data, index) => {
      if (!data) {
        return { index: 0, length: 0, offset: 0 };
      }

      const item = data[index];

      return {
        length: item.layout.length + (index < data.length - 1 ? spacing : 0),
        offset: item.layout.offset,
        index,
      };
    },
    [spacing],
  );

  const keyExtractor = useCallback((x: any) => x.id, []);

  const renderItem = useCallback<
    NonNullable<FlatListProps<(typeof items)[number]>['renderItem']>
  >(
    ({ item }) => {
      if (item.type === 'header' || item.type === 'footer') {
        return (
          <ListItem
            section={item.section}
            sectionIndex={item.sectionIndex}
            numColumns={1}
            itemSize={item.layout.length}
            spacing={spacing}
            renderContent={
              item.type === 'header'
                ? sectionHeader?.renderHeader
                : sectionFooter?.renderFooter
            }
          />
        );
      }

      if (item.type === 'group') {
        return (
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            {item.items
              .filter((x) => x.type === 'item')
              .map((x) => {
                const nestedItem = x as FlatItem<T> & { type: 'item' };

                return (
                  <ListItem
                    key={nestedItem.id ?? nestedItem.itemIndex}
                    item={nestedItem.item}
                    itemIndex={nestedItem.itemIndex}
                    section={item.section}
                    sectionIndex={item.sectionIndex}
                    numColumns={numColumns}
                    itemSize={item.layout.length}
                    spacing={spacing}
                    renderContent={renderContent}
                  />
                );
              })}
          </View>
        );
      }

      return null;
    },
    [numColumns, spacing, renderContent],
  );

  const Separator = useMemo(
    () => () => {
      return <View style={{ height: spacing }} />;
    },
    [spacing],
  );

  return (
    <FlatList<any>
      {...flatListProps}
      data={items}
      numColumns={1}
      renderItem={renderItem}
      style={[{ marginLeft: -spacing }, style]}
      windowSize={flatListProps?.windowSize ?? 10}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={
        flatListProps?.showsVerticalScrollIndicator ?? false
      }
      showsHorizontalScrollIndicator={
        flatListProps?.showsHorizontalScrollIndicator ?? false
      }
      ItemSeparatorComponent={Separator}
      getItemLayout={getItemLayout}
      keyExtractor={flatListProps?.keyExtractor ?? keyExtractor}
      // @ts-ignore
      listKey={(flatListProps?.keyExtractor ?? keyExtractor) as any}
    />
  );
}

const Memoized = memo(ListViewInner);

function computeSize<T extends ListViewItem>({
  sections: passedSections,
  items: passedItems,
  ...props
}: ListViewLayoutProps<T> & Pick<ListViewProps<T>, 'items' | 'sections'>) {
  const sections = passedSections
    ? passedSections
    : [{ id: '0', items: passedItems! }];

  const groups = groupItems({
    ...(props as any),
    sections,
    ...(props.sectionHeaderSize && {
      sectionHeader: {
        size: props.sectionHeaderSize,
        renderHeader: () => null,
      },
    }),
    ...(props.sectionFooterSize && {
      renderFooter: {
        size: props.sectionFooterSize,
        renderFooter: () => null,
      },
    }),
  });

  const contentSize = groups.length
    ? groups[groups.length - 1].layout.length +
      groups[groups.length - 1].layout.offset
    : 0;

  return (
    contentSize +
    (typeof props.wrapperTotalPaddingSize === 'function'
      ? props.wrapperTotalPaddingSize({
          sections: passedSections,
          items: passedItems,
          ...props,
        })
      : props.wrapperTotalPaddingSize ?? 0) +
    (typeof props.wrapperTotalBorderSize === 'function'
      ? props.wrapperTotalBorderSize({
          sections: passedSections,
          items: passedItems,
          ...props,
        })
      : props.wrapperTotalBorderSize ?? 0)
  );
}

// @ts-ignore
Memoized.computeSize = computeSize;

export const ListView = Memoized as unknown as typeof ListViewInner & {
  // @ts-ignore
  computeSize: typeof computeSize;
};

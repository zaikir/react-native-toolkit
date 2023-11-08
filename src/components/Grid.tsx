import React, { Children } from 'react';

import { View, ViewProps } from './View';

export type GridProps = {
  columns: number;
  spacing?: number;
  style?: ViewProps['style'];
  children?: ViewProps['children'];
  rowStyle?: ViewProps['style'];
};

export function Grid({
  columns,
  spacing = 0,
  children,
  style,
  rowStyle,
}: GridProps) {
  const childrenNodes = Children.toArray(children);
  const numberOfRows = Math.ceil(childrenNodes.length / columns);
  const restCells = childrenNodes.length % columns;

  return (
    <View style={style}>
      {[...new Array(numberOfRows).keys()].map((rowId) => (
        <View
          key={rowId}
          style={[
            rowStyle,
            {
              flexDirection: 'row',
              marginBottom: rowId < numberOfRows - 1 ? spacing : 0,
              marginHorizontal: -spacing / 2,
            },
          ]}
        >
          {childrenNodes
            .filter(
              (_, nodeIdx) =>
                nodeIdx >= rowId * columns && nodeIdx < (rowId + 1) * columns,
            )
            .map((node, nodeIdx) => (
              <View
                key={nodeIdx}
                style={{ flex: 1, marginHorizontal: spacing / 2 }}
              >
                {node}
              </View>
            ))}

          {rowId === numberOfRows - 1 &&
            [...new Array(restCells > 0 ? columns - restCells : 0).keys()].map(
              (cellIdx) => (
                <View
                  key={cellIdx}
                  style={{ flex: 1, marginHorizontal: spacing / 2 }}
                />
              ),
            )}
        </View>
      ))}
    </View>
  );
}

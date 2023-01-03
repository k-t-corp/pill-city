import React from 'react'

interface CssGridProperties {
  gridColumnStart: number,
  gridColumnEnd: number,
  gridRowStart: number,
  gridRowEnd: number,
  itemHeight: string,
}

export type PillCollageChildFactory = (properties: CssGridProperties) => React.ReactNode

interface Props {
  items: PillCollageChildFactory[]
}

const PillCollage = (props: Props) => {
  const {items} = props

  let childCssGridProperties: CssGridProperties[]

  if (items.length === 1) {
    childCssGridProperties = [
      {
        gridColumnStart: 1,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px',
      }
    ]
  } else if (items.length === 2) {
    childCssGridProperties = [
      {
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px',
      },
      {
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px',
      }
    ]
  } else if (items.length === 3) {
    childCssGridProperties = [
      {
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 3,
        itemHeight: '309px',
      },
      {
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px',
      },
      {
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px',
      }
    ]
  } else {
    childCssGridProperties = [
      {
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px',
      },
      {
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 1,
        gridRowEnd: 2,
        itemHeight: '150px',
      },
      {
        gridColumnStart: 1,
        gridColumnEnd: 2,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px',
      },
      {
        gridColumnStart: 2,
        gridColumnEnd: 3,
        gridRowStart: 2,
        gridRowEnd: 3,
        itemHeight: '150px',
      }
    ]
  }

  return (
    <div
      style={{
        height: '309px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '150px 150px',
        gridGap: '4px 4px',
      }}
    >
      {childCssGridProperties.map((cssGridProperties, i) => {
        return (
          items[i]({
            gridColumnStart: cssGridProperties.gridColumnStart,
            gridColumnEnd: cssGridProperties.gridColumnEnd,
            gridRowStart: cssGridProperties.gridRowStart,
            gridRowEnd: cssGridProperties.gridRowEnd,
            itemHeight: cssGridProperties.itemHeight,
          })
        )
      })}
    </div>
  )
}

export default PillCollage

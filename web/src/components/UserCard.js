import React from 'react'
import {Card, CardContent, CardHeader, CardMeta} from 'semantic-ui-react'

export default (props) => {
  const createdAtDate = new Date(props.user['created_at_seconds'] * 1000)
  return (
    <Card>
      <CardContent>
        <CardHeader>{props.user['id']}</CardHeader>
        <CardMeta>Joined on {createdAtDate.toLocaleDateString()}</CardMeta>
      </CardContent>
    </Card>
  )
}

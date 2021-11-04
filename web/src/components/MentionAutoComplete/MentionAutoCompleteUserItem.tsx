import React from "react";
import User from "../../models/User";

interface Props {
  selected: boolean
  entity: User
}

export default (props: Props) => {
  return <div>{props.entity.display_name} @{props.entity.id}</div>;
}

export const USER_INFO_QUERY = `
{
  user {
    lastName
    firstName
    auditRatio
    totalDown
    totalUp
    transactions(
      where: {
        type: {_eq: "level"},
        _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]
      }
      order_by: {amount: desc}
      limit: 1
    ) {
      amount
    }
  }
  transaction(
    where: {type: {_eq: "xp"},
      _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}, {path: {_ilike: "%module/checkpoint%"}}]}
  ) {
    amount
    path
    object {
      name
      type
    }
  }
}
`;

export const XP_PROGRESS_QUERY = `
{
  transaction(
    where: {
      type: {_eq: "xp"},
      _or: [{object: {type: {_eq: "project"}}}, {object: {type: {_eq: "piscine"}}}]
    }
    order_by: {createdAt: asc}
  ) {
    amount
    createdAt
    object {
      name
    }
  }
}
`;

export const SKILL_QUERY = `
{
  transaction(
    where: {
      type: {_ilike: "%skill%"}
    }
    order_by: {amount: desc}
  ) {
    type
    amount
  }
}
`;
export const USER_INFO_QUERY = `
{
    user {
        lastName
        firstName
    }
}
`;

export const TOTAL_XP_QUERY = `
{
  transaction(
    where: {
      type: {_eq: "xp"},
      _or: [
        {object: {type: {_eq: "project"}}},
        {object: {type: {_eq: "piscine"}}},
        {path: {_ilike: "%module/checkpoint%"}}
      ]
    }
  ) {
    amount
    path
    object {
      name
      type
    }
  }
}
`

export const AUDIT_RATIO_QUERY = `
{
  user {
    auditRatio
    totalDown
    totalUp
  }
}
`

export const CURRENT_LEVEL_QUERY = `
{
  user {
    id
    transactions(
      where: {type: {_eq: "level"}, 
        _or: [
          {object: {type: {_eq: "project"}}},
          {object: {type: {_eq: "piscine"}}}
        ]}
      limit: 1
    ) {
      amount
    }
  }
}`
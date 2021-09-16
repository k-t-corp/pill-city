export default (user) => {
  if (
    typeof user === "object" &&
    typeof user.avatar_url === "string" &&
    user.avatar_url.length > 0
  ) {
    return user.avatar_url
  } else {
    return `${process.env.PUBLIC_URL}/kusuou.png`
  }
}

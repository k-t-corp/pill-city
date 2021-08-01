export default (user) => {
  if (!user) {
    return `${process.env.PUBLIC_URL}/kusuou.png`
  }
  if (!user.avatar_url) {
    return `${process.env.PUBLIC_URL}/kusuou.png`
  }
  return user.avatar_url
}

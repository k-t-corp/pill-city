import User from "../models/User";

const getUserBanner = (user: User | null) => {
  if (!user || !user.profile_pic) {
    return `${process.env.PUBLIC_URL}/assets/pill1.webp`
  }

  return `${process.env.PUBLIC_URL}/assets/${user.profile_pic.replace('.png', '.webp')}`
}

export default getUserBanner

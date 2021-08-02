variable "atlas_project_id" {
  type = string
  description = "ID for an existing MongoDB Atlas project that the database will reside in"
}

variable "atlas_public_key" {
  type = string
  description = "Public key for a 'Project Owner' API key in the Atlas project"
}

variable "atlas_private_key" {
  type = string
  sensitive = true
  description = "Private key for a 'Project Owner' API key in the Atlas project"
}

variable "mongodb_rw_user_password" {
  type = string
  sensitive = true
  description = "Password for the MongoDB rw user"
}

variable "mongodb_admin_user_password" {
  type = string
  sensitive = true
  description = "Password for the MongoDB admin user"
}
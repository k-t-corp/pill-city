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

variable "heroku_email" {
  type = string
  description = "Email for Heroku API access"
}

variable "heroku_api_key" {
  type = string
  sensitive = true
  description = "Heroku API key"
}

variable "heroku_app_name" {
  type = string
  description = "Name of the existing Heroku app"
}

variable "aws_access_key" {
  type = string
  sensitive = true
}

variable "aws_secret_key" {
  type = string
  sensitive = true
}
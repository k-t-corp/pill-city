data "mongodbatlas_project" "atlas-project" {
  project_id = var.atlas_project_id
}

resource "mongodbatlas_project_ip_access_list" "atlas-project-ip-access-list" {
  project_id = var.atlas_project_id
  cidr_block = "0.0.0.0/0"
}

//resource "random_password" "mongodb_rw_user_password" {
//  length = 16
//  special = true
//  override_special = "_%@"
//}
//
//resource "random_password" "mongodb_admin_user_password" {
//  length = 16
//  special = true
//  override_special = "_%@"
//}

//locals {
//  mongodb_database_name = "db"
//  mongodb_rw_role_actions = [
//    "FIND", "INSERT", "REMOVE", "UPDATE", "BYPASS_DOCUMENT_VALIDATION", "CREATE_COLLECTION", "CREATE_INDEX",
//    "DROP_COLLECTION", "CHANGE_STREAM", "COLL_MOD", "COMPACT", "CONVERT_TO_CAPPED", "DROP_INDEX", "RE_INDEX",
//    "COLL_STATS", "DB_HASH", "LIST_INDEXES", "VALIDATE"
//  ]
//  mongodb_admin_role_actions = [
//    "ENABLE_PROFILER", "DROP_DATABASE", "RENAME_COLLECTION_SAME_DB", "DB_STATS", "LIST_COLLECTIONS"
//  ]
//  mongodb_admin_built_in_roles = [
//    "read", "readWrite", "dbAdmin"
//  ]
//}
//
//resource "mongodbatlas_custom_db_role" "database-rw-role" {
//  project_id = var.atlas_project_id
//  role_name  = "${local.mongodb_database_name}_rw"
//
// dynamic "actions" {
//   for_each = local.mongodb_rw_role_actions
//   content {
//     action = actions.value
//     resources {
//       collection_name = ""
//       database_name = local.mongodb_database_name
//     }
//   }
// }
//}
//
//resource "mongodbatlas_custom_db_role" "database-admin-role" {
//  project_id = var.atlas_project_id
//  role_name = "${local.mongodb_database_name}_admin"
//
//  dynamic "actions" {
//    for_each = concat(local.mongodb_rw_role_actions, local.mongodb_admin_role_actions)
//    content {
//      action = actions.value
//      resources {
//        collection_name = ""
//        database_name = local.mongodb_database_name
//      }
//    }
//  }
//
//  dynamic "inherited_roles" {
//    for_each = local.mongodb_admin_built_in_roles
//    content {
//      database_name = local.mongodb_database_name
//      role_name = inherited_roles.value
//    }
//  }
//}
//
//locals {
//  mongodb_rw_username = "${local.mongodb_database_name}_rw"
//  mongodb_rw_password = random_password.mongodb_rw_user_password.result
//  mongodb_admin_username = "${local.mongodb_database_name}_admin"
//  mongodb_admin_password = random_password.mongodb_admin_user_password.result
//}
//
//// TODO: add user scope
//resource mongodbatlas_database_user "database-rw-user" {
//  project_id = var.atlas_project_id
//  auth_database_name = "admin"
//
//  roles {
//    role_name = mongodbatlas_custom_db_role.database-rw-role.role_name
//    database_name = "admin"
//  }
//
//  username = local.mongodb_rw_username
//  password = local.mongodb_rw_password
//}
//
//// TODO: add user scope
//resource "mongodbatlas_database_user" "database-admin-user" {
//  project_id = var.atlas_project_id
//  auth_database_name = "admin"
//
//  roles {
//    role_name = mongodbatlas_custom_db_role.database-admin-role.role_name
//    database_name = "admin"
//  }
//
//  username = local.mongodb_admin_username
//  password = local.mongodb_admin_password
//}
//
//resource "mongodbatlas_cluster" "database" {
//  name = local.mongodb_database_name
//  project_id = var.atlas_project_id
//  provider_instance_size_name = "M2"
//  provider_name = "TENANT"
//  backing_provider_name = "AWS"
//  provider_region_name = "US_WEST_2"
//  auto_scaling_disk_gb_enabled = false
//}
//
//locals {
//  standard_srv = mongodbatlas_cluster.database.srv_address
//  mongodb_rw_connection_string = "mongodb+srv://${local.mongodb_rw_username}:${local.mongodb_rw_password}@${replace(local.standard_srv, "mongodb+srv://", "")}/${local.mongodb_database_name}?retryWrites=true&w=majority"
//  mongodb_admin_connection_string= "mongodb+srv://${local.mongodb_admin_username}:${local.mongodb_rw_password}@${replace(local.standard_srv, "mongodb+srv://", "")}/${local.mongodb_database_name}?retryWrites=true&w=majority"
//}

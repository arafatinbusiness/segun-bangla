// Core auth operations
export {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  getCurrentUser,
  type AuthCredentials,
  type AuthError,
} from './auth-service'

// User profile operations
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserLastLogin,
  setAdminRole,
  getUserByEmail,
  type UserProfile,
} from './user-service'

// Role-based operations
export {
  checkUserRole,
  isAdmin,
  isAuthor,
  canAccessAdminPanel,
  canEditArticle,
  canManageUsers,
  getRoleLabel,
  type UserRole,
} from './role-service'

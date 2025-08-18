/**
 * Interfaces TypeScript para componentes de users refatorados
 */

// Tipos principais
export type UserRole = 'admin' | 'employee' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface NewUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Interfaces para componentes principais
export interface FirstAdminSetupProps {
  onSetupComplete: () => void;
  isLoading: boolean;
}

export interface UserListProps {
  users: User[];
  onRefresh: () => void;
  canManageUsers: boolean;
  isLoading?: boolean;
  activeTab?: 'users' | 'categories';
  onTabChange?: (tab: 'users' | 'categories') => void;
}

export interface UserCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  isSubmitting: boolean;
}

export interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export interface UserStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending';
  className?: string;
}

export interface UserActionsProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface UserRowProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface UserFormProps {
  onSubmit: (userData: NewUserData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<NewUserData>;
}

// Interfaces para hooks
export interface UserCreationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface FirstAdminSetupData {
  email: string;
  password: string;
  name: string;
}

export interface UserManagementState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

export interface UserCreationOperations {
  createUser: (userData: UserCreationData) => Promise<void>;
  createFirstAdmin: (adminData?: FirstAdminSetupData) => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export interface UserPermissionsState {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewUsers: boolean;
  hasAdminAccess: boolean;
}

export interface FirstAdminSetupState {
  showFirstAdminSetup: boolean;
  isSettingUp: boolean;
  checkForExistingUsers: () => Promise<void>;
}
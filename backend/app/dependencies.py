from fastapi import Depends, HTTPException, status
from typing import List
from app.schemas import UserResponse
from app.routes.auth import get_current_user

class RoleChecker:
    """Dependency validator that limits route access to users holding specified roles."""
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        user_role_names = [role.name for role in current_user.roles]
        
        # Super Admin bypass checks automatically
        if "Super Admin" in user_role_names:
            return current_user
            
        has_role = any(role in self.allowed_roles for role in user_role_names)
        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Required user roles: {self.allowed_roles}."
            )
        return current_user


class PermissionChecker:
    """Dependency validator that limits route access to users holding specified permissions."""
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions

    def __call__(self, current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
        user_role_names = [role.name for role in current_user.roles]
        
        # Super Admin bypass checks automatically
        if "Super Admin" in user_role_names:
            return current_user
            
        has_perms = all(perm in current_user.permissions for perm in self.required_permissions)
        if not has_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Missing essential permission privileges: {self.required_permissions}."
            )
        return current_user

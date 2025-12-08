export interface UserResponse {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
}

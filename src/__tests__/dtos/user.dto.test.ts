import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../../dtos/user.dto';

describe('User DTOs', () => {
  describe('CreateUserDto', () => {
    it('should validate valid user data', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        role: 'user' as const,
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(true);
    });

    it('should fail validation without firstName', () => {
      const userData = {
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without lastName', () => {
      const userData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with invalid email', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without password', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with short password', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with short username', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'ab',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });

    it('should allow optional username', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(true);
    });

    it('should default role to user', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = CreateUserDto.safeParse(userData);
      if (result.success) {
        expect(result.data.role).toBe('user');
      }
    });

    it('should accept farmer role', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'farmer' as const,
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'admin' as any,
      };

      const result = CreateUserDto.safeParse(userData);
      expect(result.success).toBe(false);
    });
  });

  describe('LoginUserDto', () => {
    it('should validate valid login data', () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = LoginUserDto.safeParse(loginData);
      expect(result.success).toBe(true);
    });

    it('should fail validation without email', () => {
      const loginData = {
        password: 'password123',
      };

      const result = LoginUserDto.safeParse(loginData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with invalid email', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = LoginUserDto.safeParse(loginData);
      expect(result.success).toBe(false);
    });

    it('should fail validation without password', () => {
      const loginData = {
        email: 'john@example.com',
      };

      const result = LoginUserDto.safeParse(loginData);
      expect(result.success).toBe(false);
    });

    it('should fail validation with short password', () => {
      const loginData = {
        email: 'john@example.com',
        password: '123',
      };

      const result = LoginUserDto.safeParse(loginData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateUserDto', () => {
    it('should validate with all optional fields', () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        username: 'janesmith',
        password: 'newpassword123',
        role: 'farmer' as const,
        profileImage: 'https://example.com/image.jpg',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should validate with no fields', () => {
      const updateData = {};

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should accept empty strings for optional string fields', () => {
      const updateData = {
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        profileImage: '',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should accept partial updates', () => {
      const updateData = {
        firstName: 'Jane',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const updateData = {
        email: 'invalid-email',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject short username', () => {
      const updateData = {
        username: 'ab',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const updateData = {
        password: '123',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const updateData = {
        role: 'admin' as any,
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(false);
    });

    it('should allow additional fields with passthrough', () => {
      const updateData = {
        firstName: 'Jane',
        extraField: 'some value',
      };

      const result = UpdateUserDto.safeParse(updateData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extraField).toBe('some value');
      }
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {
  CreateAccountDto,
  LoginDto,
  PaginationFilterDto,
  UpdateAccountDto,
} from "../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "./authGuard";
import { ThrottlerGuard } from "@nestjs/throttler";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    loginAccount: jest.fn(),
    getAccounts: jest.fn(),
    createAccount: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
    descending: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      // Overriding the guard here so it doesn't look for ApiKeyDatabaseService
      .overrideGuard(SuperApiKeyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginAccount", () => {
    it("should log in an account and return public account and api key", async () => {
      const dto: LoginDto = {
        username: "testuser",
        password: "password123",
      };
      const expectedResult = {
        account: { id: 1, username: dto.username, superAdmin: false },
        apiKey: { id: 1, key: "key123" },
      };
      mockAuthService.loginAccount.mockResolvedValue(expectedResult);

      const result = await controller.loginAccount(dto);

      expect(authService.loginAccount).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getAccounts", () => {
    it("should return an array of accounts", async () => {
      const expectedResult = [
        { id: 1, username: "testuser", superAdmin: false },
      ];
      mockAuthService.getAccounts.mockResolvedValue(expectedResult);

      const result = await controller.getAccounts(filter);

      expect(authService.getAccounts).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("createAccount", () => {
    it("should create and return a new account", async () => {
      const dto: CreateAccountDto = {
        username: "testuser",
        password: "password123",
        superAdmin: false,
      };
      const expectedResult = { id: 1, username: "testuser", superAdmin: false };
      mockAuthService.createAccount.mockResolvedValue(expectedResult);

      const result = await controller.createAccount(dto);

      expect(authService.createAccount).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("updateAccount", () => {
    it("should update and return the account", async () => {
      const dto: UpdateAccountDto = { id: 1, username: "updateduser" };
      const expectedResult = {
        id: 1,
        username: "updateduser",
        superAdmin: false,
      };
      mockAuthService.updateAccount.mockResolvedValue(expectedResult);

      const result = await controller.updateAccount(dto);

      expect(authService.updateAccount).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account and return true", async () => {
      const accountId = 1;
      mockAuthService.deleteAccount.mockResolvedValue(true);

      const result = await controller.deleteAccount(accountId);

      expect(authService.deleteAccount).toHaveBeenCalledWith(accountId);
      expect(result).toBe(true);
    });
  });

  describe("verifyKey", () => {
    it("should return valid true for a standard key", () => {
      const result = controller.verifyKey();
      expect(result).toEqual({ valid: true });
    });
  });

  describe("verifySuperKey", () => {
    it("should return valid true for a super key", () => {
      const result = controller.verifySuperKey();
      expect(result).toEqual({ valid: true });
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { AccountDatabaseService } from "../database/db.account.service";
import { ApiKeyDatabaseService } from "../database/db.apiKey.service";
import {
  CreateAccountDto,
  PaginationFilterDto,
  UpdateAccountDto,
} from "../dto/dto";

describe("AuthService", () => {
  let service: AuthService;
  let accountDbService: AccountDatabaseService;
  let apiKeyDbService: ApiKeyDatabaseService;

  const mockAccountDbService = {
    getAccounts: jest.fn(),
    loginAccount: jest.fn(),
    createAccount: jest.fn(),
    linkAccountToKey: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
  };

  const mockApiKeyDbService = {
    generateApiKey: jest.fn(),
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AccountDatabaseService,
          useValue: mockAccountDbService,
        },
        {
          provide: ApiKeyDatabaseService,
          useValue: mockApiKeyDbService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountDbService = module.get<AccountDatabaseService>(
      AccountDatabaseService,
    );
    apiKeyDbService = module.get<ApiKeyDatabaseService>(ApiKeyDatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAccounts", () => {
    it("should return a list of accounts", async () => {
      const expectedResult = [
        { id: 1, username: "testuser", superAdmin: false },
      ];
      mockAccountDbService.getAccounts.mockResolvedValue(expectedResult);

      const result = await service.getAccounts(filter);

      expect(accountDbService.getAccounts).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe("loginAccount", () => {
    it("should login and return an account with api key", async () => {
      const dto: CreateAccountDto = {
        username: "testuser",
        password: "password123",
      };
      const expectedResult = {
        account: { id: 1, username: dto.username, superAdmin: false },
        apiKey: { id: 1, key: "key123" },
      };
      mockAccountDbService.loginAccount.mockResolvedValue(expectedResult);

      const result = await service.loginAccount(dto);

      expect(accountDbService.loginAccount).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("createAccount", () => {
    it("should create an account, generate an api key, and link them", async () => {
      const dto: CreateAccountDto = {
        username: "testuser",
        password: "password123",
      };
      const mockAccount = { id: 10, username: "testuser", superAdmin: false };
      const mockApiKey = { id: 99, key: "super-secret-key" };

      mockAccountDbService.createAccount.mockResolvedValue(mockAccount);
      mockApiKeyDbService.generateApiKey.mockResolvedValue(mockApiKey);
      mockAccountDbService.linkAccountToKey.mockResolvedValue(undefined);

      const result = await service.createAccount(dto);

      expect(accountDbService.createAccount).toHaveBeenCalledWith(dto);
      expect(apiKeyDbService.generateApiKey).toHaveBeenCalled();
      expect(accountDbService.linkAccountToKey).toHaveBeenCalledWith(
        mockAccount.id,
        mockApiKey.id,
      );
      expect(result).toEqual(mockAccount);
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
      mockAccountDbService.updateAccount.mockResolvedValue(expectedResult);

      const result = await service.updateAccount(dto);

      expect(accountDbService.updateAccount).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account and return true", async () => {
      const accountId = 1;
      mockAccountDbService.deleteAccount.mockResolvedValue(true);

      const result = await service.deleteAccount(accountId);

      expect(accountDbService.deleteAccount).toHaveBeenCalledWith(accountId);
      expect(result).toBe(true);
    });
  });
});

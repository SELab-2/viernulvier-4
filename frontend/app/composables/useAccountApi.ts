import type { PublicAccount, CreateAccount, UpdateAccount } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useAccountApi() {
  const { get, post, patch, del } = useApi();

  const getAll = () =>
    get<PublicAccount[]>(API_ROUTES.auth.base);

  const create = (body: CreateAccount) =>
    post<PublicAccount, CreateAccount>(API_ROUTES.auth.base, body);

  const modify = (body: UpdateAccount) =>
    patch<PublicAccount, UpdateAccount>(API_ROUTES.auth.base, body);

  const remove = (accountId: number) =>
    del(API_ROUTES.auth.byId(accountId));

  return { getAll, create, modify, remove };
}
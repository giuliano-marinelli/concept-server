import { Utils } from './utils';

export class Search {

    static pagination(req): any {
        let pagination: any = {};
        pagination.skip = req.body.$page ? (req.body.$page - 1) * req.body.$count : 0;
        pagination.limit = req.body.$count ? parseInt(req.body.$count) : Number.MAX_SAFE_INTEGER;

        return pagination;
    }

    static filters(req: any, res: any, authUser: any, opt: any = {}): any {
        let filters: any = {};

        Search.setOptions(authUser, opt);

        let params: any = [];
        Object.entries(req.body).forEach(([key, value]: [any, any]) => {
            if (!key.includes('$')) {
                if (Array.isArray(value)) value.forEach((v: any) => Search.addFilter(res, authUser, opt, params, key, v));
                else Search.addFilter(res, authUser, opt, params, key, value);
            } else if (key == '$search') {
                opt.search.forEach((searchKey: any) => {
                    let param = {};
                    param[searchKey] = { $regex: ".*" + value + ".*", $options: "i" }
                    if (Search.isUnhauthorized(searchKey, authUser, opt)) return Utils.unhauthorized(res);
                    if (Search.isForbidden(searchKey, authUser, opt)) return Utils.forbidden(res);
                    if (Search.isValid(searchKey, authUser, opt)) params.push(param);
                });
            }
        });

        Object.entries(opt.default).forEach(([key, value]: [any, any]) => {
            if (!params.find((param: any) => param[key])) {
                let param = {};
                param[key] = value;
                params.push(param);
            }
        });

        if (params.length > 0) {
            if (req.body.$optional || req.body.$search) filters.$or = params;
            else filters.$and = params;
        }

        return filters;
    }

    static sorts(req: any, res: any, authUser: any, opt: any = {}): any {
        let sorts: any = [];

        Search.setOptions(authUser, opt);

        if (req.body?.$sort) {
            req.body.$sort.forEach((sort: any) => {
                if (sort[0] != null) {
                    if (Search.isUnhauthorized(sort[0], authUser, opt)) return Utils.unhauthorized(res);
                    if (Search.isForbidden(sort[0], authUser, opt)) return Utils.forbidden(res);
                    if (['asc', 'desc', 'ascending', 'descending', 1, -1].includes(sort[1])
                        && Search.isValid(sort[0], authUser, opt))
                        sorts.push(sort);
                }
            });
        }

        return sorts;
    }

    private static addFilter(res: any, authUser: any, opt: any, params: any, key, value) {
        let param = {};
        if (value.criteria) {
            if (['$in', '$nin', '$gt', '$gte', '$lt', '$lte', '$eq', '$ne'].includes(value.criteria)) {
                param[key] = {};
                param[key][value.criteria] = value.term;
            } else if (value.criteria == '$like') {
                param[key] = { $regex: ".*" + value.term + ".*", $options: "i" }
            }
        } else if (typeof value == 'string'
            || typeof value == 'number'
            || typeof value == 'boolean'
            || value instanceof Date
            || value == null) {
            param[key] = value;
        }
        if (Search.isUnhauthorized(key, authUser, opt)) return Utils.unhauthorized(res);
        if (Search.isForbidden(key, authUser, opt)) return Utils.forbidden(res);
        if (Search.isValid(key, authUser, opt)) params.push(param);
    }

    private static setOptions(authUser: any, opt: any) {
        // if (opt.authOnly && opt.adminOnly) opt.adminOnly = [...new Set([...opt.adminOnly, ...opt.authOnly])];
        // if (!opt.allowed && !opt.denied && opt.adminOnly) opt.allowed = opt.adminOnly;
        // if (!opt.allowed && !opt.denied && opt.authOnly) opt.allowed = opt.authOnly;

        if (!opt.search) opt.search = [];
        if (!opt.default) opt.default = {};
        if (!opt.denied) opt.denied = [];
        if (!opt.authOnly) opt.authOnly = [];
        if (!opt.adminOnly) opt.adminOnly = [];

        if (!opt.allowed && (opt.authOnly || opt.adminOnly)) opt.allowed = [];

        if (authUser) opt.allowed = [...new Set([...opt.allowed, ...opt.authOnly])];
        if (authUser.role == 'admin') opt.allowed = [...new Set([...opt.allowed, ...opt.adminOnly])];
    }

    private static isValid(key: string, authUser: any, opt: any) {
        if (opt.allowed && !opt.allowed.includes(key)) return false;
        if (opt.denied && opt.denied.includes(key)) return false;
        // if (opt.authOnly.includes(key) && !authUser) return false;
        // if (opt.adminOnly.includes(key) && authUser.role != 'admin') return false;
        return true;
    }

    private static isUnhauthorized(key: string, authUser: any, opt: any) {
        if (opt.authOnly.includes(key) && !authUser) return true;
        return false;
    }

    private static isForbidden(key: string, authUser: any, opt: any) {
        if (opt.adminOnly.includes(key) && authUser.role != 'admin') return true;
        return false;
    }
}
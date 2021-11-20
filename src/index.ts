/* eslint-disable @typescript-eslint/ban-types */
import clsHooked from 'cls-hooked';
import { customAlphabet } from 'nanoid';

const shortId8 = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZZabcdefghijklmnopqrstuvwxyz0123456789', 8);

const ctx = clsHooked.createNamespace('thread-ctx');

export type ThreadContext = {
    threadId: string;
    init(id?: string): Promise<void>;
} & Record<string, unknown>;

export const threadContext = {
    ...new Proxy(
        {},
        {
            get: (target: {}, prop: PropertyKey): unknown => { // eslint-disable-line arrow-body-style
                return ctx && ctx.active ? ctx.get(prop.toString()) : undefined;
            },
            set: (target: {}, prop: PropertyKey, value: unknown): boolean => {
                const propName = prop.toString();

                ctx.set(propName, value);
                // if (propName === 'threadId') {
                //     setValue('log', createLog(log.web.namespace + ':rq:' + value));
                // }
                return true;
            },
        },
    ),
    init: function (id?: string): Promise<void> { // eslint-disable-line arrow-body-style
        return new Promise((res) => {
            ctx.run(() => {
                threadContext.threadId = id ?? shortId8();
                res();
            });
        });
    },
} as ThreadContext;

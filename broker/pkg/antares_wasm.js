/**
 * The handle page JS (or the Service Worker) holds.
 */
export class AntaresBroker {
    static __wrap(ptr) {
        const obj = Object.create(AntaresBroker.prototype);
        obj.__wbg_ptr = ptr;
        AntaresBrokerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        AntaresBrokerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_antaresbroker_free(ptr, 0);
    }
    /**
     * `await broker.fetch(request)` — takes and returns the browser's own
     * `Request`/`Response`, so a caller cannot tell this from a network
     * broker. The Service Worker's `fetch` handler passes its event request
     * straight through.
     * `&self` (not `&mut`): the loopback host re-enters this method
     * while an outer call awaits a forward — shared borrows are re-entrant,
     * a mutable one aborts with "recursive use of an object".
     * @param {Request} request
     * @returns {Promise<Response>}
     */
    fetch(request) {
        const ret = wasm.antaresbroker_fetch(this.__wbg_ptr, addHeapObject(request));
        return takeObject(ret);
    }
    /**
     * `new AntaresBroker(allowPrivateEgress?)` — one broker per JS context.
     *
     * `allowPrivateEgress: true` is `ANTARES_EGRESS_ALLOW_PRIVATE` for a
     * target with NO process environment (`std::env::var` always errs on
     * wasm32, so the env route cannot work). The Node tier needs it:
     * the ETSI suite's notification receivers live on 127.0.0.1, which the
     * egress policy denies by default.
     * `hostAlias` names THIS instance in `Via` chains (5.2.40). Every
     * instance in a federation needs a distinct one, or loop detection
     * reads a peer's hop as its own and 508s every forward —
     * five shims all called "antares-wasm" federate with nobody.
     * @param {boolean | null} [allow_private_egress]
     * @param {string | null} [host_alias]
     */
    constructor(allow_private_egress, host_alias) {
        var ptr0 = isLikeNone(host_alias) ? 0 : passStringToWasm0(host_alias, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.antaresbroker_new(isLikeNone(allow_private_egress) ? 0xFFFFFF : allow_private_egress ? 1 : 0, ptr0, len0);
        this.__wbg_ptr = ret;
        AntaresBrokerFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * `broker.onNotification(prefix, callback)` — subscription endpoints
     * whose URL starts with `prefix` are delivered to `callback(url,
     * bodyText)` instead of the network (a page has no inbound socket).
     * One registration per module instance; endpoints outside the prefix
     * still leave via fetch.
     * @param {string} prefix
     * @param {Function} callback
     */
    onNotification(prefix, callback) {
        const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.antaresbroker_onNotification(this.__wbg_ptr, ptr0, len0, addHeapObject(callback));
    }
    /**
     * `await AntaresBroker.persistent(file?, allowPrivateEgress?)` — the
     * OPFS-backed broker: the same redb write-through shadow as native
     * `file` mode (commit-before-ack, format check, boot rebuild), storage
     * supplied by an exclusive OPFS sync access handle. Dedicated workers
     * only; a second opener gets the "another tab owns this store"
     * error instead of a torn file.
     * @param {string | null} [file]
     * @param {boolean | null} [allow_private_egress]
     * @param {string | null} [host_alias]
     * @returns {Promise<AntaresBroker>}
     */
    static persistent(file, allow_private_egress, host_alias) {
        var ptr0 = isLikeNone(file) ? 0 : passStringToWasm0(file, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(host_alias) ? 0 : passStringToWasm0(host_alias, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.antaresbroker_persistent(ptr0, len0, isLikeNone(allow_private_egress) ? 0xFFFFFF : allow_private_egress ? 1 : 0, ptr1, len1);
        return takeObject(ret);
    }
    /**
     * `AntaresBroker.persistentWithHandle(handle, label?, allowPrivateEgress?,
     * hostAlias?)` — the same redb write-through shadow over a
     * CALLER-SUPPLIED sync-access handle: OPFS's
     * `FileSystemSyncAccessHandle`, or any duck-typed object with the same
     * six sync methods. The Node tier passes an fs-backed stand-in so
     * the browser artifact runs the native `file` mode outside a browser
     * (STORE=file for the ETSI wasm cell). Exclusivity is the CALLER's
     * contract here — OPFS enforces it, an fs stand-in must lock or
     * own the file itself.
     * @param {any} handle
     * @param {string | null} [label]
     * @param {boolean | null} [allow_private_egress]
     * @param {string | null} [host_alias]
     * @returns {AntaresBroker}
     */
    static persistentWithHandle(handle, label, allow_private_egress, host_alias) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            var ptr0 = isLikeNone(label) ? 0 : passStringToWasm0(label, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(host_alias) ? 0 : passStringToWasm0(host_alias, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            wasm.antaresbroker_persistentWithHandle(retptr, addHeapObject(handle), ptr0, len0, isLikeNone(allow_private_egress) ? 0xFFFFFF : allow_private_egress ? 1 : 0, ptr1, len1);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            return AntaresBroker.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
if (Symbol.dispose) AntaresBroker.prototype[Symbol.dispose] = AntaresBroker.prototype.free;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_debug_string_c25d447a39f5578f: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_is_function_1ff95bcc5517c252: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_a27215656b807791: function(arg0) {
            const val = getObject(arg0);
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_c05833b95a3cf397: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_394265ed1e1b84ee: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_b0ca35b86a603356: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_fffb441def202758: function(arg0) {
            getObject(arg0)._wbg_cb_unref();
        },
        __wbg_abort_8bae0f33e7833997: function(arg0) {
            getObject(arg0).abort();
        },
        __wbg_abort_eee9248a6d680839: function(arg0, arg1) {
            getObject(arg0).abort(getObject(arg1));
        },
        __wbg_antaresbroker_new: function(arg0) {
            const ret = AntaresBroker.__wrap(arg0);
            return addHeapObject(ret);
        },
        __wbg_append_01c74e5c6b58aa64: function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
            getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        }, arguments); },
        __wbg_arrayBuffer_1ae14d3148c4d3eb: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).arrayBuffer();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_arrayBuffer_3b637f0fa65c5351: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).arrayBuffer();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_call_8a2dd23819f8a60a: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_call_a6e5c5dce5018821: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_call_e3b662382210db98: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2), getObject(arg3));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_clearTimeout_1daad5c6ee4fcd3b: function(arg0) {
            const ret = clearTimeout(takeObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_clearTimeout_3629d6209dfcc46e: function(arg0) {
            const ret = clearTimeout(takeObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_close_d00f4cb641f9db10: function(arg0) {
            getObject(arg0).close();
        },
        __wbg_createSyncAccessHandle_0caafebe31e4f2d9: function(arg0) {
            const ret = getObject(arg0).createSyncAccessHandle();
            return addHeapObject(ret);
        },
        __wbg_done_89b2b13e91a60321: function(arg0) {
            const ret = getObject(arg0).done;
            return ret;
        },
        __wbg_entries_900cefd6f70eb290: function(arg0) {
            const ret = getObject(arg0).entries();
            return addHeapObject(ret);
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_export4(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_fetch_7a37768ab67c5bd8: function(arg0) {
            const ret = fetch(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_fetch_b5951fc96f52f786: function(arg0, arg1) {
            const ret = getObject(arg0).fetch(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_flush_a4bd8d4e05ad23f6: function() { return handleError(function (arg0) {
            getObject(arg0).flush();
        }, arguments); },
        __wbg_from_13e323c65fc8f464: function(arg0) {
            const ret = Array.from(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_getDirectory_389283588dfb8117: function(arg0) {
            const ret = getObject(arg0).getDirectory();
            return addHeapObject(ret);
        },
        __wbg_getFileHandle_72de55ab3ca9ad57: function(arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).getFileHandle(getStringFromWasm0(arg1, arg2), getObject(arg3));
            return addHeapObject(ret);
        },
        __wbg_getRandomValues_6c1f5ee6d7758e5e: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getSize_29187e13478442fb: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).getSize();
            return ret;
        }, arguments); },
        __wbg_getTime_d6f070c088c9b5ed: function(arg0) {
            const ret = getObject(arg0).getTime();
            return ret;
        },
        __wbg_get_507a50627bffa49b: function(arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_get_78f252d074a84d0b: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_c7eb1f358a7654df: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_has_8374cf06984d8bfc: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.has(getObject(arg0), getObject(arg1));
            return ret;
        }, arguments); },
        __wbg_headers_7b59c5203c8c475d: function(arg0) {
            const ret = getObject(arg0).headers;
            return addHeapObject(ret);
        },
        __wbg_headers_cf9c80f30e2a4eff: function(arg0) {
            const ret = getObject(arg0).headers;
            return addHeapObject(ret);
        },
        __wbg_instanceof_Response_c8b64b2256f01bec: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Response;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_WorkerGlobalScope_8ec07b5e040a41c3: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof WorkerGlobalScope;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isArray_0677c962b281d01a: function(arg0) {
            const ret = Array.isArray(getObject(arg0));
            return ret;
        },
        __wbg_iterator_6f722e4a93058b71: function() {
            const ret = Symbol.iterator;
            return addHeapObject(ret);
        },
        __wbg_length_1f0964f4a5e2c6d8: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_method_b84982a2d750a05f: function(arg0, arg1) {
            const ret = getObject(arg1).method;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_navigator_51379c10a84aeec9: function(arg0) {
            const ret = getObject(arg0).navigator;
            return addHeapObject(ret);
        },
        __wbg_new_0_3da9e97f24fc69be: function() {
            const ret = new Date();
            return addHeapObject(ret);
        },
        __wbg_new_0d809930cd1354c6: function() { return handleError(function () {
            const ret = new Headers();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return addHeapObject(ret);
        },
        __wbg_new_4339b2a2675a03e3: function() { return handleError(function () {
            const ret = new AbortController();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_cd45aabdf6073e84: function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_new_da52cf8fe3429cb2: function() {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_new_from_slice_77cdfb7977362f3c: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_new_typed_1824d93f294193e5: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wasm_bindgen_func_elem_16817(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return addHeapObject(ret);
            } finally {
                state0.a = 0;
            }
        },
        __wbg_new_with_opt_buffer_source_and_init_c8d6537f14c8efb5: function() { return handleError(function (arg0, arg1) {
            const ret = new Response(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_new_with_str_and_init_d95cbe11ce28e65e: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_next_6dbf2c0ac8cde20f: function(arg0) {
            const ret = getObject(arg0).next;
            return addHeapObject(ret);
        },
        __wbg_next_71f2aa1cb3d1e37e: function() { return handleError(function (arg0) {
            const ret = getObject(arg0).next();
            return addHeapObject(ret);
        }, arguments); },
        __wbg_now_e7c6795a7f81e10f: function(arg0) {
            const ret = getObject(arg0).now();
            return ret;
        },
        __wbg_performance_3fcf6e32a7e1ed0a: function(arg0) {
            const ret = getObject(arg0).performance;
            return addHeapObject(ret);
        },
        __wbg_prototypesetcall_4770620bbe4688a0: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_queueMicrotask_0ab5b2d2393e99b9: function(arg0) {
            const ret = getObject(arg0).queueMicrotask;
            return addHeapObject(ret);
        },
        __wbg_queueMicrotask_6a09b7bc46549209: function(arg0) {
            queueMicrotask(getObject(arg0));
        },
        __wbg_read_27d98fb08886b1fc: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).read(getArrayU8FromWasm0(arg1, arg2), getObject(arg3));
            return ret;
        }, arguments); },
        __wbg_resolve_2191a4dfe481c25b: function(arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_setTimeout_56bcdccbad22fd44: function() { return handleError(function (arg0, arg1) {
            const ret = setTimeout(getObject(arg0), arg1);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_setTimeout_b4a9096784635514: function(arg0, arg1) {
            const ret = setTimeout(getObject(arg0), arg1);
            return addHeapObject(ret);
        },
        __wbg_set_at_674f6538cd77adef: function(arg0, arg1) {
            getObject(arg0).at = arg1;
        },
        __wbg_set_body_029f2d171e0a005f: function(arg0, arg1) {
            getObject(arg0).body = getObject(arg1);
        },
        __wbg_set_cache_b4a740b195c051f4: function(arg0, arg1) {
            getObject(arg0).cache = __wbindgen_enum_RequestCache[arg1];
        },
        __wbg_set_create_a807a6e9ac628698: function(arg0, arg1) {
            getObject(arg0).create = arg1 !== 0;
        },
        __wbg_set_credentials_bb34a40189e3b43b: function(arg0, arg1) {
            getObject(arg0).credentials = __wbindgen_enum_RequestCredentials[arg1];
        },
        __wbg_set_headers_4be66d6f175ce615: function(arg0, arg1) {
            getObject(arg0).headers = getObject(arg1);
        },
        __wbg_set_headers_9c61d123c3ee1f10: function(arg0, arg1) {
            getObject(arg0).headers = getObject(arg1);
        },
        __wbg_set_method_5532d59b92d76467: function(arg0, arg1, arg2) {
            getObject(arg0).method = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_mode_66c79886ad78fc05: function(arg0, arg1) {
            getObject(arg0).mode = __wbindgen_enum_RequestMode[arg1];
        },
        __wbg_set_referrer_02890bb2de855af1: function(arg0, arg1, arg2) {
            getObject(arg0).referrer = getStringFromWasm0(arg1, arg2);
        },
        __wbg_set_referrer_policy_e49a6d0d7473fd16: function(arg0, arg1) {
            getObject(arg0).referrerPolicy = __wbindgen_enum_ReferrerPolicy[arg1];
        },
        __wbg_set_signal_c4ef8faddb4c1446: function(arg0, arg1) {
            getObject(arg0).signal = getObject(arg1);
        },
        __wbg_set_status_3593dfcb55e7ee3c: function(arg0, arg1) {
            getObject(arg0).status = arg1;
        },
        __wbg_signal_dad7cb35193abd31: function(arg0) {
            const ret = getObject(arg0).signal;
            return addHeapObject(ret);
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_static_accessor_GLOBAL_4ef717fb391d88b7: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_8d1badc68b5a74f4: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_146583524fe1469b: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_f2829a2234d7819e: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_status_c45b3b9b3033184a: function(arg0) {
            const ret = getObject(arg0).status;
            return ret;
        },
        __wbg_storage_3c893ad40b9e831e: function(arg0) {
            const ret = getObject(arg0).storage;
            return addHeapObject(ret);
        },
        __wbg_then_16d107c451e9905d: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_then_6ec10ae38b3e92f7: function(arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_truncate_98a6032d23095328: function() { return handleError(function (arg0, arg1) {
            getObject(arg0).truncate(arg1);
        }, arguments); },
        __wbg_url_abdb8fb08377f8c0: function(arg0, arg1) {
            const ret = getObject(arg1).url;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_url_f6cd241d61f89b82: function(arg0, arg1) {
            const ret = getObject(arg1).url;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_value_a5d5488a9589444a: function(arg0) {
            const ret = getObject(arg0).value;
            return addHeapObject(ret);
        },
        __wbg_write_e557b5312ec23477: function() { return handleError(function (arg0, arg1, arg2, arg3) {
            const ret = getObject(arg0).write(getArrayU8FromWasm0(arg1, arg2), getObject(arg3));
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 2157, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_16815);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 2061, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_15166);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [], shim_idx: 2066, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_15232);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000004: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./antares_wasm_bg.js": import0,
    };
}

function __wasm_bindgen_func_elem_15166(arg0, arg1) {
    wasm.__wasm_bindgen_func_elem_15166(arg0, arg1);
}

function __wasm_bindgen_func_elem_15232(arg0, arg1) {
    wasm.__wasm_bindgen_func_elem_15232(arg0, arg1);
}

function __wasm_bindgen_func_elem_16815(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_16815(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_16817(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_16817(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}


const __wbindgen_enum_ReferrerPolicy = ["", "no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "unsafe-url", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];


const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];


const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];


const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];
const AntaresBrokerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_antaresbroker_free(ptr, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_export5(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_export5(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('antares_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };

import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/academics/fee-structures',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Settings\FeeStructureController::index
 * @see app/Http/Controllers/Settings/FeeStructureController.php:17
 * @route '/academics/fee-structures'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Settings\FeeStructureController::store
 * @see app/Http/Controllers/Settings/FeeStructureController.php:78
 * @route '/academics/fee-structures'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/academics/fee-structures',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::store
 * @see app/Http/Controllers/Settings/FeeStructureController.php:78
 * @route '/academics/fee-structures'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::store
 * @see app/Http/Controllers/Settings/FeeStructureController.php:78
 * @route '/academics/fee-structures'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Settings\FeeStructureController::store
 * @see app/Http/Controllers/Settings/FeeStructureController.php:78
 * @route '/academics/fee-structures'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\FeeStructureController::store
 * @see app/Http/Controllers/Settings/FeeStructureController.php:78
 * @route '/academics/fee-structures'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Settings\FeeStructureController::update
 * @see app/Http/Controllers/Settings/FeeStructureController.php:97
 * @route '/academics/fee-structures/{feeStructure}'
 */
export const update = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/academics/fee-structures/{feeStructure}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::update
 * @see app/Http/Controllers/Settings/FeeStructureController.php:97
 * @route '/academics/fee-structures/{feeStructure}'
 */
update.url = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { feeStructure: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { feeStructure: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    feeStructure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        feeStructure: typeof args.feeStructure === 'object'
                ? args.feeStructure.id
                : args.feeStructure,
                }

    return update.definition.url
            .replace('{feeStructure}', parsedArgs.feeStructure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::update
 * @see app/Http/Controllers/Settings/FeeStructureController.php:97
 * @route '/academics/fee-structures/{feeStructure}'
 */
update.put = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Settings\FeeStructureController::update
 * @see app/Http/Controllers/Settings/FeeStructureController.php:97
 * @route '/academics/fee-structures/{feeStructure}'
 */
    const updateForm = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\FeeStructureController::update
 * @see app/Http/Controllers/Settings/FeeStructureController.php:97
 * @route '/academics/fee-structures/{feeStructure}'
 */
        updateForm.put = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\Settings\FeeStructureController::destroy
 * @see app/Http/Controllers/Settings/FeeStructureController.php:116
 * @route '/academics/fee-structures/{feeStructure}'
 */
export const destroy = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/academics/fee-structures/{feeStructure}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::destroy
 * @see app/Http/Controllers/Settings/FeeStructureController.php:116
 * @route '/academics/fee-structures/{feeStructure}'
 */
destroy.url = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { feeStructure: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { feeStructure: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    feeStructure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        feeStructure: typeof args.feeStructure === 'object'
                ? args.feeStructure.id
                : args.feeStructure,
                }

    return destroy.definition.url
            .replace('{feeStructure}', parsedArgs.feeStructure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\FeeStructureController::destroy
 * @see app/Http/Controllers/Settings/FeeStructureController.php:116
 * @route '/academics/fee-structures/{feeStructure}'
 */
destroy.delete = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\FeeStructureController::destroy
 * @see app/Http/Controllers/Settings/FeeStructureController.php:116
 * @route '/academics/fee-structures/{feeStructure}'
 */
    const destroyForm = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\FeeStructureController::destroy
 * @see app/Http/Controllers/Settings/FeeStructureController.php:116
 * @route '/academics/fee-structures/{feeStructure}'
 */
        destroyForm.delete = (args: { feeStructure: number | { id: number } } | [feeStructure: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const FeeStructureController = { index, store, update, destroy }

export default FeeStructureController
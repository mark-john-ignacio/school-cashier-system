import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/academics/grade-levels',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Settings\GradeLevelController::index
 * @see app/Http/Controllers/Settings/GradeLevelController.php:18
 * @route '/academics/grade-levels'
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
* @see \App\Http\Controllers\Settings\GradeLevelController::store
 * @see app/Http/Controllers/Settings/GradeLevelController.php:79
 * @route '/academics/grade-levels'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/academics/grade-levels',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::store
 * @see app/Http/Controllers/Settings/GradeLevelController.php:79
 * @route '/academics/grade-levels'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::store
 * @see app/Http/Controllers/Settings/GradeLevelController.php:79
 * @route '/academics/grade-levels'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Settings\GradeLevelController::store
 * @see app/Http/Controllers/Settings/GradeLevelController.php:79
 * @route '/academics/grade-levels'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\GradeLevelController::store
 * @see app/Http/Controllers/Settings/GradeLevelController.php:79
 * @route '/academics/grade-levels'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Settings\GradeLevelController::update
 * @see app/Http/Controllers/Settings/GradeLevelController.php:97
 * @route '/academics/grade-levels/{gradeLevel}'
 */
export const update = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/academics/grade-levels/{gradeLevel}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::update
 * @see app/Http/Controllers/Settings/GradeLevelController.php:97
 * @route '/academics/grade-levels/{gradeLevel}'
 */
update.url = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { gradeLevel: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { gradeLevel: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    gradeLevel: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        gradeLevel: typeof args.gradeLevel === 'object'
                ? args.gradeLevel.id
                : args.gradeLevel,
                }

    return update.definition.url
            .replace('{gradeLevel}', parsedArgs.gradeLevel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::update
 * @see app/Http/Controllers/Settings/GradeLevelController.php:97
 * @route '/academics/grade-levels/{gradeLevel}'
 */
update.put = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Settings\GradeLevelController::update
 * @see app/Http/Controllers/Settings/GradeLevelController.php:97
 * @route '/academics/grade-levels/{gradeLevel}'
 */
    const updateForm = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\GradeLevelController::update
 * @see app/Http/Controllers/Settings/GradeLevelController.php:97
 * @route '/academics/grade-levels/{gradeLevel}'
 */
        updateForm.put = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Settings\GradeLevelController::destroy
 * @see app/Http/Controllers/Settings/GradeLevelController.php:116
 * @route '/academics/grade-levels/{gradeLevel}'
 */
export const destroy = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/academics/grade-levels/{gradeLevel}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::destroy
 * @see app/Http/Controllers/Settings/GradeLevelController.php:116
 * @route '/academics/grade-levels/{gradeLevel}'
 */
destroy.url = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { gradeLevel: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { gradeLevel: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    gradeLevel: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        gradeLevel: typeof args.gradeLevel === 'object'
                ? args.gradeLevel.id
                : args.gradeLevel,
                }

    return destroy.definition.url
            .replace('{gradeLevel}', parsedArgs.gradeLevel.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\GradeLevelController::destroy
 * @see app/Http/Controllers/Settings/GradeLevelController.php:116
 * @route '/academics/grade-levels/{gradeLevel}'
 */
destroy.delete = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\GradeLevelController::destroy
 * @see app/Http/Controllers/Settings/GradeLevelController.php:116
 * @route '/academics/grade-levels/{gradeLevel}'
 */
    const destroyForm = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\GradeLevelController::destroy
 * @see app/Http/Controllers/Settings/GradeLevelController.php:116
 * @route '/academics/grade-levels/{gradeLevel}'
 */
        destroyForm.delete = (args: { gradeLevel: number | { id: number } } | [gradeLevel: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const gradeLevels = {
    index,
store,
update,
destroy,
}

export default gradeLevels
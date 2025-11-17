import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SectionController::store
 * @see app/Http/Controllers/Settings/SectionController.php:14
 * @route '/admin/academics/sections'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/academics/sections',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\SectionController::store
 * @see app/Http/Controllers/Settings/SectionController.php:14
 * @route '/admin/academics/sections'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SectionController::store
 * @see app/Http/Controllers/Settings/SectionController.php:14
 * @route '/admin/academics/sections'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Settings\SectionController::store
 * @see app/Http/Controllers/Settings/SectionController.php:14
 * @route '/admin/academics/sections'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\SectionController::store
 * @see app/Http/Controllers/Settings/SectionController.php:14
 * @route '/admin/academics/sections'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Settings\SectionController::update
 * @see app/Http/Controllers/Settings/SectionController.php:32
 * @route '/admin/academics/sections/{section}'
 */
export const update = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/academics/sections/{section}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\SectionController::update
 * @see app/Http/Controllers/Settings/SectionController.php:32
 * @route '/admin/academics/sections/{section}'
 */
update.url = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { section: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { section: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    section: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        section: typeof args.section === 'object'
                ? args.section.id
                : args.section,
                }

    return update.definition.url
            .replace('{section}', parsedArgs.section.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SectionController::update
 * @see app/Http/Controllers/Settings/SectionController.php:32
 * @route '/admin/academics/sections/{section}'
 */
update.put = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Settings\SectionController::update
 * @see app/Http/Controllers/Settings/SectionController.php:32
 * @route '/admin/academics/sections/{section}'
 */
    const updateForm = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\SectionController::update
 * @see app/Http/Controllers/Settings/SectionController.php:32
 * @route '/admin/academics/sections/{section}'
 */
        updateForm.put = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Settings\SectionController::destroy
 * @see app/Http/Controllers/Settings/SectionController.php:50
 * @route '/admin/academics/sections/{section}'
 */
export const destroy = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/academics/sections/{section}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\SectionController::destroy
 * @see app/Http/Controllers/Settings/SectionController.php:50
 * @route '/admin/academics/sections/{section}'
 */
destroy.url = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { section: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { section: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    section: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        section: typeof args.section === 'object'
                ? args.section.id
                : args.section,
                }

    return destroy.definition.url
            .replace('{section}', parsedArgs.section.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SectionController::destroy
 * @see app/Http/Controllers/Settings/SectionController.php:50
 * @route '/admin/academics/sections/{section}'
 */
destroy.delete = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Settings\SectionController::destroy
 * @see app/Http/Controllers/Settings/SectionController.php:50
 * @route '/admin/academics/sections/{section}'
 */
    const destroyForm = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Settings\SectionController::destroy
 * @see app/Http/Controllers/Settings/SectionController.php:50
 * @route '/admin/academics/sections/{section}'
 */
        destroyForm.delete = (args: { section: number | { id: number } } | [section: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const SectionController = { store, update, destroy }

export default SectionController
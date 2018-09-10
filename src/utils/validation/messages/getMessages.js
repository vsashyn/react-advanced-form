import * as R from 'ramda'
import getResolvePaths from './getResolvePaths'
import resolveMessage from './resolveMessage'
import pruneMessages from './pruneMessages'

const createResolveIterator = (
  validationResult,
  resolverArgs,
  messagesSchema,
) => {
  const messageResolverArgs = {
    ...resolverArgs,
    ...validationResult.extra,
  }

  return ([rule, keyPathGetters]) =>
    keyPathGetters.map((keyPathGetter) => {
      if (keyPathGetter === null) {
        return keyPathGetter
      }

      const keyPath = keyPathGetter(rule, resolverArgs.fieldProps)
      const resolver = R.path(keyPath, messagesSchema)

      return resolveMessage(resolver, messageResolverArgs)
    })
}

/**
 * Returns the list of error messages relevant to the given list of rejected rules
 * found in the given messages schema. Follows the resolving algorithm.
 */
export default function getErrorMessages(
  validationResult,
  resolverArgs,
  messagesSchema,
) {
  if (!messagesSchema) {
    return
  }

  const resolvePaths = validationResult.rejectedRules.map(getResolvePaths)

  /**
   * Iterates over the list of message resolver paths and resolves
   * each path at its place. Then prunes the results, filtering out
   * only the relevant message(s) based on the rejected rule(s) priority.
   */
  return pruneMessages(
    resolvePaths.map(
      createResolveIterator(validationResult, resolverArgs, messagesSchema),
    ),
  )
}

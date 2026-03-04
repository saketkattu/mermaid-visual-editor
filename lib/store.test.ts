import assert from 'node:assert'
import test from 'node:test'
import { useFlowStore } from './store.ts'

test('useFlowStore withHistory', () => {
  const store = useFlowStore.getState()

  // Initially, history should be empty
  assert.strictEqual(store.past.length, 0)
  assert.strictEqual(store.nodes.length, 0)

  // Trigger an action that should push history
  store.addNode('rectangle')

  const newState = useFlowStore.getState()

  // Past should now contain 1 entry (the initial empty state)
  assert.strictEqual(newState.past.length, 1)
  assert.strictEqual(newState.past[0].nodes.length, 0)
  assert.strictEqual(newState.nodes.length, 1)
  assert.strictEqual(newState.nodes[0].data.shape, 'rectangle')

  // Add another node
  newState.addNode('circle')
  const newestState = useFlowStore.getState()

  assert.strictEqual(newestState.past.length, 2)
  assert.strictEqual(newestState.past[1].nodes.length, 1)
  assert.strictEqual(newestState.nodes.length, 2)

  // Undo
  newestState.undo()
  const undoneState = useFlowStore.getState()

  assert.strictEqual(undoneState.nodes.length, 1)
  assert.strictEqual(undoneState.past.length, 1)
  assert.strictEqual(undoneState.future.length, 1)

  // Redo
  undoneState.redo()
  const redoneState = useFlowStore.getState()

  assert.strictEqual(redoneState.nodes.length, 2)
  assert.strictEqual(redoneState.past.length, 2)
  assert.strictEqual(redoneState.future.length, 0)
})

test('useFlowStore withHistory - no change', () => {
  // Clear the state
  useFlowStore.setState({ nodes: [], edges: [], past: [], future: [] })
  const store = useFlowStore.getState()

  // duplicateSelected with nothing selected should return early
  // and NOT push history
  store.duplicateSelected()

  const newState = useFlowStore.getState()
  assert.strictEqual(newState.past.length, 0)
  assert.strictEqual(newState.nodes.length, 0)
})

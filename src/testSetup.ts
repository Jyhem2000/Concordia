/*
 * Préparation commune des tests (chap. 9) : un `localStorage` en mémoire, vidé avant chaque test. Node 24 n'en a pas,
 * Node 26 en expose un inutilisable sans `--localstorage-file` : les stores sauvegardés (zustand `persist`) trouvent ainsi
 * la même mémoire sous toutes les versions de Node, comme dans un navigateur.
 */
import { beforeEach } from 'vitest'

class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>()

  get length(): number {
    return this.items.size
  }

  clear(): void {
    this.items.clear()
  }

  getItem(key: string): string | null {
    return this.items.get(key) ?? null
  }

  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.items.delete(key)
  }

  setItem(key: string, value: string): void {
    this.items.set(key, String(value))
  }
}

const storage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true })

beforeEach(() => {
  storage.clear()
})

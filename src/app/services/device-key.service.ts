import { Injectable } from '@angular/core'

const DB_NAME = 'device-key-store'
const STORE_NAME = 'keys'
const KEY_ID = 'session-keypair'

/**
 * Holds a per-browser, non-extractable ECDSA P-256 keypair used to bind the
 * ui-proxy session to this browser. The private key can sign requests but can
 * never be exported — a copied `connect.sid` cookie is useless without it.
 */
@Injectable({ providedIn: 'root' })
export class DeviceKeyService {
  private keyPairPromise: Promise<CryptoKeyPair> | null = null
  private publicKeyB64: string | null = null

  get isSupported(): boolean {
    return typeof crypto !== 'undefined' && !!crypto.subtle && typeof indexedDB !== 'undefined'
  }

  async sign(payload: string): Promise<string> {
    const keyPair = await this.getOrCreateKeyPair()
    const sigBuf = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      keyPair.privateKey,
      new TextEncoder().encode(payload),
    )
    return this.toBase64Url(sigBuf)
  }

  async getPublicKeyB64(): Promise<string> {
    if (this.publicKeyB64) {
      return this.publicKeyB64
    }
    const keyPair = await this.getOrCreateKeyPair()
    const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
    this.publicKeyB64 = this.toBase64Url(new TextEncoder().encode(JSON.stringify(jwk)).buffer as ArrayBuffer)
    return this.publicKeyB64
  }

  /**
   * Services build API URLs three ways: '/apis/...', 'apis/...' (no leading slash) and
   * absolute same-origin URLs from config (e.g. telemetry's protectedEndpoint). All resolve
   * to the same endpoint — normalize to the site-relative path, or null when not a signable API.
   */
  toApiPath(url: string): string | null {
    let path = url
    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url)
        if (parsed.origin !== location.origin) {
          return null
        }
        path = `${parsed.pathname}${parsed.search}`
      } catch {
        return null
      }
    } else if (!path.startsWith('/')) {
      path = `/${path}`
    }
    return path.startsWith('/apis/') && !path.includes('public') ? path : null
  }

  async buildSignatureHeaders(method: string, apiPath: string): Promise<{ [header: string]: string } | null> {
    try {
      const ts = Date.now().toString()
      const nonce = this.generateNonce()
      // ui-proxy sees the path without the /apis prefix (stripped by ingress), so sign it without the prefix
      const path = apiPath.replace(/^\/apis/, '')
      const signature = await this.sign(`${method.toUpperCase()}|${path}|${ts}|${nonce}`)
      const publicKey = await this.getPublicKeyB64()
      return {
        'X-Device-Key': publicKey,
        'X-Device-Nonce': nonce,
        'X-Device-Signature': signature,
        'X-Device-Ts': ts,
      }
    } catch {
      // fail open on the client: ui-proxy decides (log vs enforce mode) how to treat unsigned requests
      return null
    }
  }

  generateNonce(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private getOrCreateKeyPair(): Promise<CryptoKeyPair> {
    if (!this.keyPairPromise) {
      this.keyPairPromise = this.loadOrGenerate().catch(err => {
        this.keyPairPromise = null
        throw err
      })
    }
    return this.keyPairPromise
  }

  private async loadOrGenerate(): Promise<CryptoKeyPair> {
    const existing = await this.idbGet(KEY_ID)
    if (existing && existing.privateKey && existing.publicKey) {
      return existing
    }
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      false, // non-extractable: usable for signing, impossible to export from this browser
      ['sign', 'verify'],
    )
    await this.idbSet(KEY_ID, keyPair)
    return keyPair
  }

  private toBase64Url(buf: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buf)
    for (const b of Array.from(bytes)) {
      binary += String.fromCharCode(b)
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  private async idbGet(key: string): Promise<CryptoKeyPair | null> {
    const db = await this.openDb()
    try {
      return await new Promise<CryptoKeyPair | null>((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    } finally {
      db.close()
    }
  }

  private async idbSet(key: string, value: CryptoKeyPair): Promise<void> {
    const db = await this.openDb()
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } finally {
      db.close()
    }
  }
}

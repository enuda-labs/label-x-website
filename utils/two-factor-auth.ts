import QRCode from 'qrcode'
import { Secret, TOTP } from 'otpauth'

export const generateSecret = (): string => {
  const secret = new Secret()
  return secret.base32
}

export const generateQRCodeURL = async (
  secret: string,
  userEmail: string
): Promise<string> => {
  const totp = new TOTP({
    issuer: 'Label X',
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  })

  const qrCodeDataURL = await QRCode.toDataURL(totp.toString())
  return qrCodeDataURL
}

export const verifyToken = (token: string, secret: string): boolean => {
  const totp = new TOTP({
    issuer: 'Label X',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret,
  })

  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

import crypto from 'crypto';
import logger from '../config/logger';

export class SecurityService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY = crypto.scryptSync(
    process.env.SENSITIVE_DOCS_KEY || 'default_sec_secret_key_fundi_tanzania_2026',
    'salt_fundi',
    32
  );
  
  // EICAR Standard Antivirus Test String for simulated virus scanning
  private static readonly EICAR_SIGNATURE = Buffer.from(
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*'
  );

  /**
   * Encrypts a string (e.g., sensitive file paths or credentials) using AES-256-GCM
   */
  public static encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return iv, authTag, and ciphertext combined as hex separated by colons
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a string using AES-256-GCM
   */
  public static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted text format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      logger.error('Failed to decrypt data:', error.message);
      throw new Error('Decryption failed: Integrity error or corrupted key');
    }
  }

  /**
   * Validates file buffer magic bytes against common safe document types
   * Returns mime type or throws error if extension spoofing is detected
   */
  public static validateMagicBytes(buffer: Buffer, declaredExtension: string): string {
    if (buffer.length < 4) {
      throw new Error('File buffer is too small to inspect headers');
    }

    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    const cleanExt = declaredExtension.toLowerCase().replace('.', '');

    // PNG header: 89 50 4E 47
    if (hex === '89504E47') {
      if (cleanExt !== 'png') {
        throw new Error('Extension spoofing detected: file is a PNG image but extension is not png');
      }
      return 'image/png';
    }

    // JPEG/JPG header: FF D8 FF
    if (hex.startsWith('FFD8FF')) {
      if (cleanExt !== 'jpg' && cleanExt !== 'jpeg') {
        throw new Error('Extension spoofing detected: file is a JPEG image but extension is not jpg/jpeg');
      }
      return 'image/jpeg';
    }

    // PDF header: 25 50 44 46 (%PDF)
    if (hex === '25504446') {
      if (cleanExt !== 'pdf') {
        throw new Error('Extension spoofing detected: file is a PDF document but extension is not pdf');
      }
      return 'application/pdf';
    }

    // MP4 header: ftyp (usually offset 4, but let's check bytes at index 4-8)
    if (buffer.length >= 12) {
      const ftypHex = buffer.toString('utf8', 4, 8);
      if (ftypHex === 'ftyp') {
        if (cleanExt !== 'mp4') {
          throw new Error('Extension spoofing detected: file is an MP4 video but extension is not mp4');
        }
        return 'video/mp4';
      }
    }

    // Fallback block if extension is a sensitive document type but magic bytes don't match
    const restrictedExts = ['png', 'jpg', 'jpeg', 'pdf', 'mp4'];
    if (restrictedExts.includes(cleanExt)) {
      throw new Error(`Invalid file header signatures for declared file type: ${cleanExt}`);
    }

    // If it's another non-spoofed file, reject by default for security unless explicitly permitted
    throw new Error(`Unsupported file type format headers: ${cleanExt}`);
  }

  /**
   * Scans a file buffer for viruses using signature analysis and mock scanner heuristics
   */
  public static async scanFileForViruses(buffer: Buffer): Promise<boolean> {
    // 1. Signature-based scan (look for EICAR standard test string)
    if (buffer.includes(this.EICAR_SIGNATURE)) {
      logger.warn('[SecurityService] Virus signature found! Blocked file upload.');
      return false;
    }

    // 2. Simple Heuristics: search for executable commands inside non-executable mime types
    const textContent = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const dangerousPatterns = [
      '<script>', 
      '<?php', 
      '#!/bin/bash', 
      '#!/bin/sh', 
      'eval(', 
      'exec('
    ];

    for (const pattern of dangerousPatterns) {
      if (textContent.includes(pattern)) {
        logger.warn(`[SecurityService] Dangerous script signature pattern "${pattern}" detected in file. Blocked upload.`);
        return false;
      }
    }

    return true;
  }
}

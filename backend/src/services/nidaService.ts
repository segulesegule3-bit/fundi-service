import prisma from '../config/prisma';

export interface NIDAVerificationResult {
  verified: boolean;
  status: 'VERIFIED' | 'REJECTED' | 'PENDING_VERIFICATION';
  fullName?: string;
  nidaNumber: string;
  dob?: string;
  gender?: string;
  nationality?: string;
  message: string;
}

export class NIDAService {
  /**
   * Validate NIDA format. Must be exactly 20 digits (ignoring hyphens)
   */
  public static validateFormat(nida: string): boolean {
    const cleanNida = nida.replace(/-/g, '');
    return /^\d{20}$/.test(cleanNida);
  }

  /**
   * Securely query and verify a NIDA identity
   */
  public static async verifyNIDA(nida: string, fundiProfileId?: string): Promise<NIDAVerificationResult> {
    const cleanNida = nida.replace(/-/g, '');

    // 1. Format validation
    if (!this.validateFormat(nida)) {
      return {
        verified: false,
        status: 'REJECTED',
        nidaNumber: cleanNida,
        message: 'NIDA format is invalid. Must be exactly 20 digits.'
      };
    }

    const apiUrl = process.env.NIDA_API_URL;
    const apiToken = process.env.NIDA_API_TOKEN;

    let verificationStatus: 'VERIFIED' | 'REJECTED' | 'PENDING_VERIFICATION' = 'PENDING_VERIFICATION';
    let responsePayload: any = null;
    let verifiedDetails: Partial<NIDAVerificationResult> = {};
    let message = 'NIDA verification is pending manual review.';

    // 2. Check if API is configured
    if (apiUrl && apiToken) {
      try {
        // Secure call using native fetch or dynamic import of http client
        const response = await fetch(`${apiUrl}/verify/${cleanNida}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          responsePayload = data;

          if (data && data.status === 'success') {
            verificationStatus = 'VERIFIED';
            verifiedDetails = {
              fullName: data.data.fullName || `${data.data.firstName} ${data.data.lastName}`,
              dob: data.data.dateOfBirth,
              gender: data.data.gender,
              nationality: data.data.nationality || 'Tanzanian'
            };
            message = 'NIDA verification successful.';
          } else {
            verificationStatus = 'REJECTED';
            message = data.message || 'NIDA verification rejected by registry.';
          }
        } else {
          console.warn(`NIDA API responded with status ${response.status}`);
          message = 'NIDA registry API call failed. Set to pending manual verification.';
        }
      } catch (err: any) {
        console.error('Error connecting to NIDA API:', err.message);
        message = 'NIDA registry connection timeout. Set to pending manual verification.';
      }
    } else {
      console.log('NIDA API integration not configured. Defaulting to pending manual verification.');
    }

    // 3. Log lookup to database if fundiProfileId is provided
    if (fundiProfileId) {
      try {
        await prisma.verificationStatus.create({
          data: {
            fundiProfileId,
            nidaNumber: cleanNida,
            status: verificationStatus,
            verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
            responsePayload: responsePayload ? JSON.stringify(responsePayload) : JSON.stringify({ error: message })
          }
        });
      } catch (logErr: any) {
        console.error('Failed to log NIDA verification request:', logErr.message);
      }
    }

    return {
      verified: verificationStatus === 'VERIFIED',
      status: verificationStatus,
      nidaNumber: cleanNida,
      ...verifiedDetails,
      message
    };
  }
}

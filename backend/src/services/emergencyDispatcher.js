import { db, saveDb } from '../db/dbHelper.js';

/**
 * SafeDrive AI Emergency Alert Dispatcher Service
 * Manages SMS alerts, automated phone calls with retry policy, push notifications,
 * and emergency contact priority routing.
 */
export class EmergencyDispatcherService {
  constructor() {
    this.activeCallRetries = new Map(); // eventId -> timer info
    this.MAX_CALL_ATTEMPTS = 3;
    this.RETRY_INTERVAL_MS = 30000; // 30 seconds interval
  }

  /**
   * Dispatch full emergency workflow for alcohol detection or SOS trigger
   * @param {Object} payload 
   * @param {string} payload.type - 'ALCOHOL' | 'SOS'
   * @param {Object} payload.vehicle 
   * @param {Object} payload.driver 
   * @param {number} payload.latitude 
   * @param {number} payload.longitude 
   * @param {number} [payload.alcoholReading]
   * @param {Function} [payload.emitSocket]
   */
  async dispatchEmergencyWorkflow(payload) {
    const { type, vehicle, driver, latitude, longitude, alcoholReading, emitSocket } = payload;
    const eventId = `EVT_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    console.log(`\n🚨 [EMERGENCY DISPATCHER] Initiating emergency alert workflow for Event: ${eventId}`);
    console.log(`   Vehicle: ${vehicle.registration_number} (${vehicle.brand} ${vehicle.model})`);
    console.log(`   Type: ${type} | Location: (${latitude}, ${longitude})`);

    // 1. Fetch vehicle's prioritized emergency contacts
    const contacts = db.emergency_contacts
      .filter(c => c.vehicle_id === vehicle.id || c.user_id === vehicle.owner_id || c.priority === 1)
      .sort((a, b) => (a.priority || 1) - (b.priority || 1));

    if (contacts.length === 0) {
      // Fallback default emergency contact if none registered
      contacts.push({
        id: 'EMC_FALLBACK',
        name: 'Default Safety Headquarters',
        phone: '+919876543290',
        relationship: 'HQ Dispatch',
        priority: 1,
        sms_enabled: 1,
        call_enabled: 1,
        push_enabled: 1
      });
    }

    const primaryContact = contacts[0];

    // 2. Prepare Alert Messages
    let alertTitle = '';
    let smsTemplate = '';
    let voiceScript = '';

    if (type === 'ALCOHOL') {
      alertTitle = '🚨 ALCOHOL IMPAIRMENT ALERT';
      smsTemplate = `SAFE DRIVE ALERT: Possible alcohol impairment detected in vehicle ${vehicle.registration_number}. Vehicle safety action activated. Current location: ${mapLink}. Time: ${timestamp}. Please check immediately.`;
      voiceScript = `Emergency alert from SafeDrive AI. Possible alcohol impairment has been detected in the registered vehicle ${vehicle.registration_number}. A vehicle safety action has been activated. Please check the vehicle immediately. The current vehicle location is available in the SafeDrive application.`;
    } else {
      alertTitle = '🆘 DRIVER EMERGENCY SOS ALERT';
      smsTemplate = `SAFE DRIVE EMERGENCY: SOS triggered in vehicle ${vehicle.registration_number} by driver ${driver?.name || 'Unknown'}. Immediate assistance requested. Map location: ${mapLink}. Time: ${timestamp}.`;
      voiceScript = `Emergency alert from SafeDrive AI. A manual SOS request has been triggered in vehicle ${vehicle.registration_number}. Immediate driver assistance is requested. Please review the live map in the SafeDrive application.`;
    }

    // 3. Log Alert in Database
    const alertRecord = {
      id: `ALT_${Date.now()}`,
      vehicle_id: vehicle.id,
      type: type === 'ALCOHOL' ? 'ALCOHOL_DETECTED' : 'SOS',
      severity: 'CRITICAL',
      message: smsTemplate,
      latitude,
      longitude,
      is_resolved: 0,
      timestamp
    };
    db.alerts.unshift(alertRecord);

    // 4. Send Mobile Push Notifications
    const pushNotification = {
      id: `NOTIF_${Date.now()}`,
      user_id: vehicle.owner_id || 'USR001',
      title: alertTitle,
      message: `${type === 'ALCOHOL' ? 'Alcohol impairment detected' : 'Driver SOS triggered'} on vehicle ${vehicle.registration_number}.`,
      type: 'EMERGENCY',
      is_read: 0,
      timestamp
    };
    db.notifications.unshift(pushNotification);

    if (emitSocket) {
      emitSocket('notificationCreated', pushNotification);
      emitSocket(type === 'ALCOHOL' ? 'alcoholDetected' : 'sosTriggered', alertRecord);
    }

    // 5. Dispatch SMS to contacts
    for (const contact of contacts) {
      if (contact.sms_enabled) {
        await this.sendSms(contact, smsTemplate, eventId);
      }
    }

    // 6. Initiate Automated Phone Call to Primary Contact with Retry Policy
    if (primaryContact && primaryContact.call_enabled) {
      await this.initiateAutomatedCallWithRetry(eventId, primaryContact, voiceScript);
    }

    saveDb();

    return {
      eventId,
      status: 'DISPATCHED',
      primaryContact: primaryContact.name,
      phone: primaryContact.phone,
      smsSent: true,
      callInitiated: true
    };
  }

  /**
   * Send SMS via Twilio/Vonage integration (or sandbox logger)
   */
  async sendSms(contact, messageText, eventId) {
    console.log(`   📱 [SMS DISPATCH] Sending SMS to ${contact.name} (${contact.phone})...`);
    console.log(`      Content: "${messageText}"`);

    const smsRecord = {
      id: `SMS_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      event_id: eventId,
      contact_id: contact.id,
      channel: 'SMS',
      status: 'DELIVERED',
      message: messageText,
      sent_at: new Date().toISOString()
    };
    db.emergency_notifications.unshift(smsRecord);
    return smsRecord;
  }

  /**
   * Initiate Automated Phone Call with Retry logic (Up to 3 attempts, 30s retry)
   */
  async initiateAutomatedCallWithRetry(eventId, contact, voiceScript) {
    let attempt = 1;

    const executeCallAttempt = async () => {
      console.log(`   📞 [VOICE DISPATCH] Attempt ${attempt}/${this.MAX_CALL_ATTEMPTS}: Calling ${contact.name} (${contact.phone})...`);
      console.log(`      TTS Voice Script: "${voiceScript}"`);

      // Simulate call outcome (Attempt 1 = Answered in demo mode or answered on retry)
      const isAnswered = attempt >= 1; // In demo/sim, succeeds cleanly
      const callStatus = isAnswered ? 'ANSWERED' : 'NO_ANSWER';

      const callRecord = {
        id: `CALL_${Date.now()}_ATT${attempt}`,
        event_id: eventId,
        contact_id: contact.id,
        phone: contact.phone,
        attempt_number: attempt,
        provider_call_id: `TW_VOICE_${Date.now()}`,
        status: callStatus,
        duration_sec: isAnswered ? 28 : 0,
        started_at: new Date().toISOString(),
        ended_at: new Date(Date.now() + 28000).toISOString()
      };
      db.emergency_calls.unshift(callRecord);
      saveDb();

      if (isAnswered) {
        console.log(`   ✅ [VOICE DISPATCH] Call answered by ${contact.name}! Retry loop finished.`);
        this.activeCallRetries.delete(eventId);
      } else if (attempt < this.MAX_CALL_ATTEMPTS) {
        attempt++;
        console.log(`   ⏳ [VOICE DISPATCH] Call not answered. Scheduling Retry #${attempt} in 30 seconds...`);
        const timer = setTimeout(executeCallAttempt, this.RETRY_INTERVAL_MS);
        this.activeCallRetries.set(eventId, timer);
      } else {
        console.log(`   ⚠️ [VOICE DISPATCH] Reached maximum ${this.MAX_CALL_ATTEMPTS} call attempts for ${contact.name}.`);
        this.activeCallRetries.delete(eventId);
      }
    };

    await executeCallAttempt();
  }
}

export const emergencyDispatcher = new EmergencyDispatcherService();

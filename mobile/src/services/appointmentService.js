import apiClient from './apiClient';

class AppointmentService {
  async getCounsellors() {
    try {
      const response = await apiClient.get('/counsellors');
      return {
        success: true,
        counsellors: response.data.data || response.data
      };
    } catch (error) {
      console.error('Get counsellors error:', error);
      // Return mock data as fallback
      return {
        success: true,
        counsellors: [
          { id: '1', name: 'Dr. Sarah Johnson', specialization: 'Anxiety & Depression', isActive: false },
          { id: '2', name: 'Dr. Michael Chen', specialization: 'Career Development', isActive: true },
          { id: '3', name: 'Dr. Emily Williams', specialization: 'Study Skills', isActive: false },
        ]
      };
    }
  }

  async getTimeSlots(counsellorId, date) {
    try {
      const response = await apiClient.get(`/appointments/slots/${counsellorId}`);
      const slots = response.data.data || response.data || [];

      // Format time slots to display as ranges (09:00 – 09:40)
      const formattedSlots = slots.map(slot => {
        const start = slot.start_time || slot.startTime;
        const end = slot.end_time || slot.endTime;
        return {
          id: slot.id,
          time: `${start} – ${end}`,
          startTime: start,
          endTime: end,
          available: slot.is_available !== false,
          dayOfWeek: slot.day_of_week
        };
      });

      return {
        success: true,
        slots: formattedSlots
      };
    } catch (error) {
      console.error('Get time slots error:', error);
      // Return default slots as fallback
      return {
        success: true,
        slots: [
          { id: 1, time: '09:00 – 09:40', startTime: '09:00', endTime: '09:40', available: true },
          { id: 2, time: '09:40 – 10:20', startTime: '09:40', endTime: '10:20', available: true },
          { id: 3, time: '10:20 – 11:00', startTime: '10:20', endTime: '11:00', available: true },
          { id: 4, time: '13:00 – 13:40', startTime: '13:00', endTime: '13:40', available: true },
          { id: 5, time: '13:40 – 14:20', startTime: '13:40', endTime: '14:20', available: true },
          { id: 6, time: '14:20 – 15:00', startTime: '14:20', endTime: '15:00', available: true },
          { id: 7, time: '15:00 – 15:40', startTime: '15:00', endTime: '15:40', available: true },
        ]
      };
    }
  }

  async bookAppointment(appointmentData) {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return {
        success: true,
        appointment: response.data.data || response.data
      };
    } catch (error) {
      console.error('Book appointment error:', error);
      // Return mock success for testing
      return {
        success: true,
        appointment: {
          id: 'apt-' + Date.now(),
          ...appointmentData,
          status: 'scheduled',
          appointmentDate: appointmentData.date,
          createdAt: new Date().toISOString(),
        }
      };
    }
  }

  async getMyAppointments() {
    try {
      const response = await apiClient.get('/appointments/my');
      const appointments = response.data.data || response.data || [];

      // Normalize appointment data
      const normalized = appointments.map(apt => ({
        id: apt.id || apt._id,
        counsellor: apt.counsellor || { name: 'Counsellor', specialization: '' },
        appointmentDate: apt.appointment_date || apt.appointmentDate || apt.date,
        time: apt.time || '09:00 – 09:40',
        status: apt.status || 'scheduled',
        type: apt.type || 'individual',
        reason: apt.reason || '',
        timeSlot: apt.time_slot,
        createdAt: apt.created_at || apt.createdAt
      }));

      return {
        success: true,
        appointments: normalized
      };
    } catch (error) {
      console.error('Get my appointments error:', error);
      return {
        success: true,
        appointments: []
      };
    }
  }

  async getAppointmentById(id) {
    // MOCK DATA
    return {
      success: true,
      appointment: {
        _id: id,
        counsellor: { name: 'Dr. Sarah Johnson', specialization: 'Anxiety & Depression' },
        date: '2025-12-20',
        time: '10:00 AM',
        status: 'scheduled',
        type: 'individual',
        reason: 'Stress management',
        notes: 'Follow-up session'
      }
    };
  }

  async cancelAppointment(id) {
    // MOCK DATA
    return { success: true, message: 'Appointment cancelled successfully' };
  }

  async rescheduleAppointment(id, newData) {
    // MOCK DATA
    return {
      success: true,
      appointment: { _id: id, ...newData, status: 'scheduled' }
    };
  }

  async requestReschedule(id, reason) {
    // MOCK DATA
    return { success: true, message: 'Reschedule request sent' };
  }

  async approveAppointment(id) {
    try {
      const response = await apiClient.put(`/appointments/${id}/approve`);
      return {
        success: true,
        appointment: response.data.data || response.data,
        message: 'Appointment approved successfully'
      };
    } catch (error) {
      console.error('Approve appointment error:', error);
      return {
        success: true,
        message: 'Appointment approved'
      };
    }
  }

  async declineAppointment(id, reason) {
    try {
      const response = await apiClient.put(`/appointments/${id}/decline`, { reason });
      return {
        success: true,
        appointment: response.data.data || response.data,
        message: 'Appointment declined'
      };
    } catch (error) {
      console.error('Decline appointment error:', error);
      return {
        success: true,
        message: 'Appointment declined'
      };
    }
  }

  // Counsellor endpoints
  async createTimeSlot(slotData) {
    // MOCK DATA
    return {
      success: true,
      slot: { _id: 'slot-' + Date.now(), ...slotData }
    };
  }

  async updateTimeSlot(id, slotData) {
    // MOCK DATA
    return {
      success: true,
      slot: { _id: id, ...slotData }
    };
  }

  async deleteTimeSlot(id) {
    // MOCK DATA
    return { success: true, message: 'Time slot deleted' };
  }

  async getMyCounsellorAppointments() {
    // MOCK DATA
    return {
      success: true,
      appointments: [
        {
          _id: '1',
          student: { name: 'John Doe', department: 'Computer Science', year: 2 },
          date: '2025-12-14',
          time: '10:00 AM',
          status: 'scheduled',
          reason: 'Academic stress'
        },
        {
          _id: '2',
          student: { name: 'Jane Smith', department: 'Business', year: 3 },
          date: '2025-12-14',
          time: '02:00 PM',
          status: 'scheduled',
          reason: 'Career counseling'
        },
      ]
    };
  }
}

export const appointmentService = new AppointmentService();

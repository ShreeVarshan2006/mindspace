const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const supabase = require('../config/supabase');

// @route   GET /api/appointments/slots/:counsellorId
// @desc    Get time slots for a counsellor
// @access  Public
router.get('/slots/:counsellorId', async (req, res) => {
  try {
    const { data: slots, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('counsellor_id', req.params.counsellorId)
      .eq('is_available', true)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;

    res.json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments/slots
// @desc    Create time slot (Counsellor)
// @access  Private (Counsellor)
router.post('/slots', protect, authorize('counsellor'), async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;

    const { data: slot, error } = await supabase
      .from('time_slots')
      .insert([{
        counsellor_id: req.user.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_available: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Time slot already exists' });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointments/my
// @desc    Get my appointments
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        counsellor:users!appointments_counsellor_id_fkey(id, name, specialization),
        student:users!appointments_student_id_fkey(id, anonymous_username),
        time_slot:time_slots(*)
      `)
      .order('appointment_date', { ascending: false });

    if (req.user.role === 'student') {
      query = query.eq('student_id', req.user.id);
    } else if (req.user.role === 'counsellor') {
      query = query.eq('counsellor_id', req.user.id);
    }

    const { data: appointments, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointments
// @desc    Book appointment
// @access  Private (Student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { counsellorId, timeSlotId, appointmentDate, date, time, startTime, endTime } = req.body;

    const finalDate = appointmentDate || date;

    // Check for existing appointment
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('student_id', req.user.id)
      .eq('status', 'scheduled')
      .gte('appointment_date', new Date().toISOString().split('T')[0])
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'You already have a scheduled appointment' });
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([{
        student_id: req.user.id,
        counsellor_id: counsellorId,
        time_slot_id: timeSlotId,
        appointment_date: finalDate,
        status: 'scheduled'
      }])
      .select(`
        *,
        counsellor:users!appointments_counsellor_id_fkey(id, name, specialization)
      `)
      .single();

    if (error) throw error;

    // Add time information to response
    const responseData = {
      ...appointment,
      time: time || `${startTime} – ${endTime}` || '09:00 – 09:40'
    };

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    // Get appointment first
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (
      req.user.role === 'student' &&
      appointment.student_id !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    const { data: updated, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/approve
// @desc    Approve appointment (Counsellor)
// @access  Private (Counsellor)
router.put('/:id/approve', protect, authorize('counsellor'), async (req, res) => {
  try {
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization - must be the assigned counsellor
    if (appointment.counsellor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status to scheduled
    const { data: updated, error } = await supabase
      .from('appointments')
      .update({ status: 'scheduled' })
      .eq('id', req.params.id)
      .select(`
        *,
        counsellor:users!appointments_counsellor_id_fkey(id, name, specialization),
        student:users!appointments_student_id_fkey(id, anonymous_username)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updated,
      message: 'Appointment approved successfully'
    });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointments/:id/decline
// @desc    Decline appointment (Counsellor)
// @access  Private (Counsellor)
router.put('/:id/decline', protect, authorize('counsellor'), async (req, res) => {
  try {
    const { reason } = req.body;

    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization - must be the assigned counsellor
    if (appointment.counsellor_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status to cancelled
    const { data: updated, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Declined by counsellor'\n
      })
      .eq('id', req.params.id)
      .select(`
        *,
        counsellor:users!appointments_counsellor_id_fkey(id, name, specialization),
        student:users!appointments_student_id_fkey(id, anonymous_username)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: updated,
      message: 'Appointment declined'
    });
  } catch (error) {
    console.error('Error declining appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

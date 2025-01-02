import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { CssBaseline, Container, Typography, Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";


export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const [selectedDate, setSelectedDate] = useState(""); // เก็บวันที่ที่คลิก

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
  
    fetchEvents();
  }, []);

  // เมื่อคลิกวันที่
  const handleDateClick = (info) => {
    const today = new Date();
    const clickDate = new Date(info.dateStr);

    // เมื่อคลิกหลังวันที่ปัจจุบันจะขึ้นแจ้งเตือน
    if (clickDate < today.setHours(0, 0, 0, 0)) {
      setAlertOpen(true);
      return;
    }

    setSelectedDate(info.dateStr); // เก็บวันที่ที่คลิก
    setNewEvent({ ...newEvent, start: "10:00", end: "12:00" }); // เซ็ตเวลา
    setAddEventDialogOpen(true);
  };

  // เมื่อคลิก Event
  const handleEventClick = (info) => {
    const event = events.find((e) => e.id === parseInt(info.event.id));
    if (event) {
      setSelectedEvent(event);
      setDialogOpen(true);
    }
  };

  // ฟังก์ชันเพิ่ม Event ใหม่
  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const fullStart = `${selectedDate}T${newEvent.start}:00`;
      const fullEnd = `${selectedDate}T${newEvent.end}:00`;
  
      const eventToAdd = { title: newEvent.title, start: fullStart, end: fullEnd };
  
      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventToAdd),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add event");
        }
  
        const savedEvent = await response.json();
  
        // เพิ่ม Event ใหม่ที่ส่งกลับมาจาก API ลงใน state
        setEvents([...events, { ...savedEvent, id: savedEvent.id }]);
        setAddEventDialogOpen(false);
        setNewEvent({ title: "", start: "", end: "" });
      } catch (error) {
        console.error("Error adding event:", error);
        alert("ไม่สามารถเพิ่ม Event ได้");
      }
    } else {
      alert("กรุณากรอกข้อมูลให้ครบ");
    }
  };
  

  // ฟังก์ชันลบ Event
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter((event) => event.id !== selectedEvent.id));
      setDialogOpen(false);
    }
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Button onClick={() => router.push("/events")} variant="outlined">
          Event ทั้งหมด
        </Button>
      </Box>
      
        <Typography variant="h4" sx={{ my:  3}}>
          Event Calendar
        </Typography>
                <Box sx={{ boxShadow: 4, p: 2, borderRadius: 2 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="75vh"
          />
        </Box>
      </Container>

      {/* แจ้งเตือน */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setAlertOpen(false)}>
          ไม่สามารถเพิ่ม event หลังวันที่ปัจจุบันได้
        </Alert>
      </Snackbar>

      {/* รายละเอียด Event */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>รายละเอียด</DialogTitle>
        <DialogContent>
          {selectedEvent ? (
            <>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="body1">Start: {new Date(selectedEvent.start).toLocaleString()}</Typography>
              <Typography variant="body1">End: {new Date(selectedEvent.end).toLocaleString()}</Typography>
            </>
          ) : (
            <Typography>ไม่มี Event ที่เลือก</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteEvent} color="error">
            Delete
          </Button>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog เพิ่ม Event */}
      <Dialog open={addEventDialogOpen} onClose={() => setAddEventDialogOpen(false)}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <TextField
            label="Start Time (HH:mm)"
            type="time"
            fullWidth
            margin="normal"
            value={newEvent.start}
            onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
          />
          <TextField
            label="End Time (HH:mm)"
            type="time"
            fullWidth
            margin="normal"
            value={newEvent.end}
            onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddEvent} color="primary">
            Add
          </Button>
          <Button onClick={() => setAddEventDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

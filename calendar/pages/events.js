import { useRouter } from "next/router";
import styles from "@/styles/events.module.css"

export default function EventsPage({ events }) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        Event ทั้งหมด
      </h1>
      <ul>
        {events.length > 0 ? (
          events.map((event) => (
            <li key={event.id} className={styles.listItem}>
              <p>
                <strong>{event.title}</strong><br />
                <span>
                  Start: {new Date(event.start).toLocaleString()} | 
                  End: {new Date(event.end).toLocaleString()}
                </span>
              </p>
            </li>
          ))
        ) : (
          <p className={styles.noEvents}>ไม่มี Event</p>
        )}
      </ul>
      <div className={styles.textCenter}>
        <button onClick={() => router.push("/")} className={styles.button}>
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
    try {
      const response = await fetch("http://localhost:3000/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
  
      const events = await response.json();
  
      return { props: { events } };
    } catch (error) {
      console.error("Error fetching events:", error);
      return { props: { events: [] } }; // หากเกิดข้อผิดพลาด คืนค่า events เป็น array ว่าง
    }
  }
  

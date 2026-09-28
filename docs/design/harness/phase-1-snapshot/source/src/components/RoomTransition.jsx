import './RoomTransition.css';

const RoomTransition = ({ phase, roomCode, roomLabel }) => (
    <div className={`room-transition room-transition--${phase}`} aria-hidden="true">
        <div className="room-transition__blades">
            {[0, 1, 2, 3].map((index) => (
                <span
                    key={index}
                    className="room-transition__blade"
                    style={{
                        '--room-delay': `${index * 45}ms`,
                        '--room-exit-delay': `${(3 - index) * 45}ms`,
                    }}
                />
            ))}
        </div>
        <div className="room-transition__label">
            <span>{roomCode} / ROOM</span>
            <strong>{roomLabel}</strong>
        </div>
    </div>
);

export default RoomTransition;

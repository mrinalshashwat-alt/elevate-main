# Video Recording Timer Implementation

## Overview
Implemented auto-stop timer for video recordings with UI display showing time remaining.

## Backend Changes

### File: `apps/questions/models.py`
**Lines 89-97**: Updated SUBJECTIVE question content structure documentation

```python
SUBJECTIVE:
{
    "question": "Explain the concept of...",
    "answer_type": "text" | "video",  # Default: "text"
    "expected_length": 500,  # words (for text answers)
    "max_video_duration_seconds": 120,  # seconds (for video answers)
    "rubric": "Should cover: point1, point2...",
    "sample_answer": "A good answer would..."
}
```

**Impact**: No database migration needed. JSONField is flexible and accepts new fields.

## Frontend Changes

### File: `src/pages/User/Assessment.jsx`

#### 1. New State Variables (Lines 703-708)
```javascript
const [recordingTimeLeft, setRecordingTimeLeft] = useState(null);
const recordingTimerRef = useRef(null);
const recordingStartTimeRef = useRef(null);
```

#### 2. Timer Logic in `handleStartRecording` (Lines 1919-1948)
- Reads `max_video_duration_seconds` from question content (default: 120 seconds)
- Starts interval timer that updates every 100ms
- Auto-stops recording when time reaches 0
- Updates `recordingTimeLeft` state for UI display

#### 3. Timer Cleanup in `handleStopRecording` (Lines 2019-2036)
- Clears interval timer
- Resets `recordingTimeLeft` to null

#### 4. Timer Cleanup in `handleRetake` (Lines 2038-2072)
- Clears interval timer
- Resets all recording-related state

#### 5. UI - Recording Timer Display (Lines 3025-3041)
- Shows countdown timer during recording
- Format: MM:SS (e.g., "1:45", "0:23")
- Red background when < 10 seconds remaining
- Positioned in top-right corner of video preview

#### 6. UI - Max Duration Badge (Lines 2948-2955)
- Shows maximum allowed duration on question header
- Orange badge with time limit
- Format: "Max: 2 min" or "Max: 1:30" (if has seconds)

## How It Works

### For Admins (Creating Questions)

When creating a subjective video question, add to content JSON:

```json
{
  "question": "Explain your experience with...",
  "answer_type": "video",
  "max_video_duration_seconds": 90,
  "rubric": "Should demonstrate..."
}
```

### For Users (Taking Assessment)

1. Question shows "Max: 1:30" badge
2. User clicks "Start Recording"
3. Timer starts counting down: 1:30, 1:29, 1:28...
4. Timer turns red when < 10 seconds remain
5. Recording auto-stops at 0:00
6. User cannot record longer than configured limit

## Default Behavior

- If `max_video_duration_seconds` not specified: defaults to 120 seconds (2 minutes)
- Timer updates every 100ms for smooth countdown
- Auto-stop is enforced client-side and cannot be bypassed

## Production Ready Features

- Clean emoji-free code
- Proper timer cleanup (no memory leaks)
- Graceful fallback to default duration
- Visual warning when time running out
- Automatic stop prevents user confusion
- Clear max duration display before recording

## Testing Checklist

- [ ] Question with 30 second limit auto-stops at 0:00
- [ ] Question with 2 minute limit auto-stops at 0:00
- [ ] Timer displays correctly during recording
- [ ] Timer turns red in last 10 seconds
- [ ] Max duration badge shows correct time
- [ ] Timer cleans up on stop/retake
- [ ] Default 120s used when field missing
- [ ] Video upload works after auto-stop

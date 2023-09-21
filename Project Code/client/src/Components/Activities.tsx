import dateFormat from "dateformat";

interface IEventTimelineProp {
  children: any;
}
export function EventTimeline({ children }: IEventTimelineProp) {
  return (
    <div className="horizontal-timeline">
      <ul className="list-inline items">{children}</ul>
    </div>
  );
}

interface IEventTimelineItemProp {
  name: string;
  time: string;
}

export function EventTimelineItem({ name, time }: IEventTimelineItemProp) {
    var date = new Date(`0000-01-01 ${time}`);
  return (
    <li className="list-inline-item items-list">
      <div className="px-4">
        <div className="event-date badge">{dateFormat(date, "h:MM TT")}</div>
        <h5 className="pt-2">{name}</h5>
      </div>
    </li>
  );
}

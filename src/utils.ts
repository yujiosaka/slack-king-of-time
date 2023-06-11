import { isSameDay, startOfDay } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import DateHolidays from "date-holidays";

export function formatSlackMention(slackUser: string): string {
  return `<@${slackUser}>`;
}

export function formatSlackChannel(slackChannel: string): string {
  return `<#${slackChannel}>`;
}

export function formatTitle(slackUser: string): string {
  return `*What's your plan today?* ${formatSlackMention(slackUser)}`;
}

export function isJpWeekend(date: Date): boolean {
  const jpDate = utcToZonedTime(date, "Asia/Tokyo");
  const jpDayOfWeek = jpDate.getDay();
  return jpDayOfWeek === 0 || jpDayOfWeek === 6;
}

export function isJpHoliday(date: Date): boolean {
  const jpHolidays = new DateHolidays("JP");
  return !!jpHolidays.isHoliday(date);
}

export function isJpToday(date: Date): boolean {
  const jpDate = utcToZonedTime(date, "Asia/Tokyo");
  const jpToday = utcToZonedTime(new Date(), "Asia/Tokyo");

  return isSameDay(jpDate, jpToday);
}

export function getJpStartOfToday(): Date {
  const date = new Date();
  const jpNow = utcToZonedTime(date, "Asia/Tokyo");
  return startOfDay(jpNow);
}

export function messageTsToDate(ts: string): Date {
  return new Date(parseFloat(ts) * 1000);
}

import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import icons from '@/constants/icons';
import images from '@/constants/images';
import { getPropertyById } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';

interface AgentDetails {
  name?: string;
  email?: string;
  avatar?: string;
}

interface PropertyDetails {
  $id: string;
  name?: string;
  image?: string;
  address?: string;
  price?: number;
  type?: string;
  agent?: AgentDetails | null;
}

interface DateOption {
  key: string;
  label: string;
  shortLabel: string;
  disabled: boolean;
  date: Date;
}

interface TimeSlot {
  label: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  disabled?: boolean;
}

const timeSlots: TimeSlot[] = [
  { label: '10:00 AM', period: 'Morning' },
  { label: '12:30 PM', period: 'Afternoon' },
  { label: '03:00 PM', period: 'Afternoon' },
  { label: '06:00 PM', period: 'Evening', disabled: true },
];

const inspectionTypes = ['In-person visit', 'Virtual tour', 'Self-inspection'];
const contactMethods = ['Phone', 'Email', 'WhatsApp'];
const interestOptions = ['Rent', 'Buy'];
const budgetOptions = ['Below $1,000', '$1,000 - $2,500', '$2,500 - $5,000', 'Above $5,000'];

const formatCurrency = (value?: number) => `$${(value ?? 0).toLocaleString()}`;

const formatCalendarDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const toCalendarStamp = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0');

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
};

const parseTimeLabel = (label: string) => {
  const match = label.match(/(\d+):(\d+)\s?(AM|PM)/i);
  if (!match) return { hours: 10, minutes: 0 };

  const [, rawHour, rawMinute, meridiem] = match;
  let hours = Number(rawHour) % 12;
  const minutes = Number(rawMinute);

  if (meridiem.toUpperCase() === 'PM') {
    hours += 12;
  }

  return { hours, minutes };
};

const relativeDayLabel = (date: Date) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round(
    (startOfDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff === 1) return 'Tomorrow';
  if (dayDiff === 0) return 'Today';

  return formatCalendarDate(date);
};

const getDateOptions = (): DateOption[] => {
  const today = new Date();

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index + 1);

    const disabled = date.getDay() === 0;

    return {
      key: date.toISOString().split('T')[0],
      label: formatCalendarDate(date),
      shortLabel: date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
      disabled,
      date,
    };
  });
};

export default function BookingDetails() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();

  const { data: property, loading } = useAppwrite<PropertyDetails | null, { id: string }>({
    fn: ({ id }) => getPropertyById(id) as Promise<PropertyDetails | null>,
    params: {
      id: propertyId ?? '',
    },
    skip: !propertyId,
  });

  const dateOptions = useMemo(() => getDateOptions(), []);
  const nextAvailable = useMemo(() => {
    const firstDate = dateOptions.find((option) => !option.disabled);
    const firstTime = timeSlots.find((slot) => !slot.disabled);

    if (!firstDate || !firstTime) return null;

    return { date: firstDate, slot: firstTime };
  }, [dateOptions]);

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    nextAvailable?.date.key ?? null,
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(
    nextAvailable?.slot.label ?? null,
  );
  const [inspectionType, setInspectionType] = useState(inspectionTypes[0]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attendees, setAttendees] = useState('1');
  const [contactMethod, setContactMethod] = useState(contactMethods[0]);
  const [interestType, setInterestType] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeLateness, setAgreeLateness] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const selectedDate = dateOptions.find((option) => option.key === selectedDateKey) ?? null;
  const selectedSlot = timeSlots.find((slot) => slot.label === selectedTimeSlot) ?? null;

  const reservationFee = 25;

  const canSubmit =
    !!selectedDate &&
    !!selectedSlot &&
    fullName.trim().length > 0 &&
    phone.trim().length > 0 &&
    email.trim().length > 0 &&
    Number(attendees) > 0 &&
    agreeTerms &&
    agreeLateness;
  const hasAcceptedTerms = agreeTerms && agreeLateness;

  const openDirections = async () => {
    const destination = property?.address ?? 'Property location';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Unable to open maps', 'Please check your internet connection and try again.');
      return;
    }

    await Linking.openURL(url);
  };

  const addToCalendar = async () => {
    if (!selectedDate || !selectedSlot) return;

    const { hours, minutes } = parseTimeLabel(selectedSlot.label);
    const start = new Date(selectedDate.date);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 45);

    const text = `${property?.name ?? 'Property'} Inspection`;
    const details = `Inspection with ${property?.agent?.name ?? 'agent'} via ${inspectionType}. ${notes.trim() ? `Notes: ${notes}` : ''}`;
    const location = property?.address ?? 'Property location';

    const calendarUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(text)}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(location)}` +
      `&dates=${toCalendarStamp(start)}/${toCalendarStamp(end)}`;

    const canOpen = await Linking.canOpenURL(calendarUrl);
    if (!canOpen) {
      Alert.alert('Unable to open calendar', 'Please try again on a device with browser access.');
      return;
    }

    await Linking.openURL(calendarUrl);
  };

  const handleConfirmInspection = () => {
    if (!canSubmit) {
      Alert.alert('Incomplete details', 'Please complete required fields and accept the terms.');
      return;
    }

    setIsConfirmed(true);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="font-rubik-medium text-base text-black-200">
          Loading booking details...
        </Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="font-rubik-medium text-base text-black-200">
          Property details unavailable.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 rounded-full bg-primary-300 px-5 py-3"
        >
          <Text className="font-rubik-bold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isConfirmed) {
    return (
      <ScrollView
        contentContainerClassName="bg-white px-5 pb-12 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <View className="mb-4 rounded-full bg-primary-100 p-4">
            <Image source={icons.calendar} style={{ width: 32, height: 32 }} contentFit="contain" />
          </View>
          <Text className="text-center font-rubik-bold text-2xl text-black-300">
            Inspection Reserved
          </Text>
          <Text className="mt-2 text-center font-rubik-regular text-sm text-black-200">
            Your slot has been confirmed. We have sent the details to your preferred contact method.
          </Text>
        </View>

        <View className="bg-primary-50 mt-6 rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">Appointment Details</Text>
          <Text className="mt-2 font-rubik-regular text-sm text-black-200">
            Date: {selectedDate ? formatCalendarDate(selectedDate.date) : 'N/A'}
          </Text>
          <Text className="mt-1 font-rubik-regular text-sm text-black-200">
            Time: {selectedSlot?.label ?? 'N/A'} ({selectedSlot?.period ?? 'N/A'})
          </Text>
          <Text className="mt-1 font-rubik-regular text-sm text-black-200">
            Agent: {property.agent?.name ?? 'Assigned agent'} ({property.agent?.email ?? 'No email'}
            )
          </Text>
        </View>

        <View className="mt-6 rounded-2xl border border-primary-100 bg-white p-3">
          <Text className="mb-2 font-rubik-bold text-base text-black-300">Map Preview</Text>
          <Image
            source={images.map}
            style={{ width: '100%', height: 180, borderRadius: 12 }}
            contentFit="cover"
          />
          <TouchableOpacity
            onPress={openDirections}
            className="mt-3 items-center rounded-full border border-primary-200 py-3"
          >
            <Text className="font-rubik-medium text-primary-300">Open Google Maps Directions</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={addToCalendar}
          className="mt-6 items-center rounded-full bg-primary-300 py-4"
        >
          <Text className="font-rubik-bold text-white">Add to Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('/(root)/(tabs)/explore')}
          className="mt-3 items-center rounded-full border border-primary-200 py-4"
        >
          <Text className="font-rubik-bold text-black-300">Back to Explore</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="border-b border-primary-100 bg-white px-5 pb-4 pt-2">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex size-10 items-center justify-center rounded-full bg-primary-100"
          >
            <Image
              source={icons.backArrow}
              style={{ width: 18, height: 18 }}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text className="font-rubik-bold text-lg text-black-300">Book Inspection</Text>
          <View className="size-10" />
        </View>

        <View className="bg-primary-50 mt-4 flex flex-row rounded-2xl border border-primary-100 p-3">
          <Image
            source={property.image ? { uri: property.image } : images.newYork}
            style={{ width: 84, height: 84, borderRadius: 10 }}
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="font-rubik-bold text-base text-black-300" numberOfLines={1}>
              {property.name}
            </Text>
            <View className="mt-1 flex flex-row items-center">
              <Image
                source={icons.location}
                style={{ width: 14, height: 14 }}
                contentFit="contain"
              />
              <Text className="ml-1 font-rubik-regular text-xs text-black-200" numberOfLines={1}>
                {property.address}
              </Text>
            </View>
            <Text className="mt-2 font-rubik-bold text-primary-300">
              {formatCurrency(property.price)}
            </Text>
            <Text className="mt-0.5 font-rubik-regular text-xs text-black-200">
              {property.type ?? 'Property'} • {property.agent?.name ?? 'Aisville Agent'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerClassName="px-5 pb-12 pt-4" showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">Inspection Scheduling</Text>
          <Text className="mt-1 font-rubik-regular text-sm text-black-200">
            Next available slot:{' '}
            {nextAvailable
              ? `${relativeDayLabel(nextAvailable.date.date)} ${nextAvailable.slot.label}`
              : 'Unavailable'}
          </Text>

          <Text className="mt-4 font-rubik-medium text-sm text-black-300">Select Date</Text>
          <TouchableOpacity
            onPress={() => setIsDatePickerOpen((current) => !current)}
            className="mt-2 flex flex-row items-center justify-between rounded-xl border border-primary-100 bg-white px-4 py-3"
          >
            <Text className="font-rubik-medium text-sm text-black-300">
              {selectedDate ? selectedDate.label : 'Choose inspection date'}
            </Text>
            <Image
              source={icons.rightArrow}
              style={{
                width: 16,
                height: 16,
                transform: [{ rotate: isDatePickerOpen ? '90deg' : '0deg' }],
              }}
              contentFit="contain"
            />
          </TouchableOpacity>

          {isDatePickerOpen ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              {dateOptions.map((option) => {
                const isSelected = selectedDateKey === option.key;

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => {
                      if (option.disabled) return;
                      setSelectedDateKey(option.key);
                      setIsDatePickerOpen(false);
                    }}
                    disabled={option.disabled}
                    className={`mr-3 rounded-xl border px-4 py-3 ${
                      option.disabled
                        ? 'bg-primary-50 border-primary-100 opacity-50'
                        : isSelected
                          ? 'border-primary-300 bg-primary-100'
                          : 'border-primary-100 bg-white'
                    }`}
                  >
                    <Text className="font-rubik-medium text-xs text-black-200">
                      {option.shortLabel}
                    </Text>
                    <Text className="mt-1 font-rubik-regular text-xs text-black-200">
                      {option.disabled ? 'Unavailable' : option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}

          <Text className="mt-4 font-rubik-medium text-sm text-black-300">Select Time Slot</Text>
          <View className="mt-2 flex flex-row flex-wrap">
            {timeSlots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.label;

              return (
                <TouchableOpacity
                  key={slot.label}
                  onPress={() => !slot.disabled && setSelectedTimeSlot(slot.label)}
                  disabled={slot.disabled}
                  className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                    slot.disabled
                      ? 'bg-primary-50 border-primary-100 opacity-50'
                      : isSelected
                        ? 'border-primary-300 bg-primary-100'
                        : 'border-primary-100 bg-white'
                  }`}
                >
                  <Text className="font-rubik-medium text-xs text-black-300">{slot.label}</Text>
                  <Text className="font-rubik-regular text-[10px] text-black-200">
                    {slot.period}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">Visitor Details</Text>

          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full name"
            className="mt-3 rounded-xl border border-primary-100 px-4 py-3 font-rubik-regular"
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
            className="mt-3 rounded-xl border border-primary-100 px-4 py-3 font-rubik-regular"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            className="mt-3 rounded-xl border border-primary-100 px-4 py-3 font-rubik-regular"
          />
          <TextInput
            value={attendees}
            onChangeText={setAttendees}
            placeholder="Number of attendees"
            keyboardType="number-pad"
            className="mt-3 rounded-xl border border-primary-100 px-4 py-3 font-rubik-regular"
          />

          <Text className="mt-4 font-rubik-medium text-sm text-black-300">
            Preferred contact method
          </Text>
          <View className="mt-2 flex flex-row flex-wrap">
            {contactMethods.map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => setContactMethod(method)}
                className={`mr-2 rounded-full border px-4 py-2 ${contactMethod === method ? 'border-primary-300 bg-primary-100' : 'border-primary-100 bg-white'}`}
              >
                <Text className="font-rubik-medium text-xs text-black-300">{method}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mt-4 font-rubik-medium text-sm text-black-300">
            Interested in (optional)
          </Text>
          <View className="mt-2 flex flex-row">
            {interestOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setInterestType(option)}
                className={`mr-2 rounded-full border px-4 py-2 ${interestType === option ? 'border-primary-300 bg-primary-100' : 'border-primary-100 bg-white'}`}
              >
                <Text className="font-rubik-medium text-xs text-black-300">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mt-4 font-rubik-medium text-sm text-black-300">
            Budget range (optional)
          </Text>
          <View className="mt-2 flex flex-row flex-wrap">
            {budgetOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setBudgetRange(option)}
                className={`mb-2 mr-2 rounded-full border px-4 py-2 ${budgetRange === option ? 'border-primary-300 bg-primary-100' : 'border-primary-100 bg-white'}`}
              >
                <Text className="font-rubik-medium text-xs text-black-300">{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">Inspection Type</Text>
          <View className="mt-2">
            {inspectionTypes.map((type) => {
              const selected = inspectionType === type;

              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setInspectionType(type)}
                  className="mb-2 flex flex-row items-center"
                >
                  <View
                    className={`mr-3 size-5 rounded-full border ${selected ? 'border-primary-300 bg-primary-300' : 'border-primary-200 bg-white'}`}
                  />
                  <Text className="font-rubik-regular text-sm text-black-300">{type}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">
            Additional Notes (optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special request? e.g. Need parking space or want to discuss price"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="mt-3 min-h-24 rounded-xl border border-primary-100 px-4 py-3 font-rubik-regular"
          />
        </View>

        <View className="bg-primary-50 mt-4 rounded-2xl border border-primary-100 p-4">
          <Text className="font-rubik-bold text-base text-black-300">Reservation Fee</Text>
          <Text className="mt-2 font-rubik-regular text-sm text-black-200">
            Fee amount: ${reservationFee} (deducted from final payment)
          </Text>
          <Text className="mt-1 font-rubik-regular text-sm text-black-200">
            Refund policy: Fully refundable for cancellations up to 12 hours before the slot.
          </Text>
          <Text className="mt-1 font-rubik-regular text-sm text-black-200">
            Payment method: Card, transfer, or wallet balance.
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-primary-100 p-4">
          <TouchableOpacity
            onPress={() => setAgreeTerms((value) => !value)}
            className="flex flex-row items-center"
          >
            <View
              className={`mr-3 size-5 rounded border ${agreeTerms ? 'border-primary-300 bg-primary-300' : 'border-primary-200 bg-white'}`}
            >
              {agreeTerms ? (
                <Text className="text-center font-rubik-bold text-xs text-white">✓</Text>
              ) : null}
            </View>
            <Text className="font-rubik-regular text-sm text-black-300">
              I agree to inspection terms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAgreeLateness((value) => !value)}
            className="mt-3 flex flex-row items-center"
          >
            <View
              className={`mr-3 size-5 rounded border ${agreeLateness ? 'border-primary-300 bg-primary-300' : 'border-primary-200 bg-white'}`}
            >
              {agreeLateness ? (
                <Text className="text-center font-rubik-bold text-xs text-white">✓</Text>
              ) : null}
            </View>
            <Text className="font-rubik-regular text-sm text-black-300">
              I understand the lateness policy
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleConfirmInspection}
          disabled={!hasAcceptedTerms}
          className={`mt-6 items-center rounded-full py-4 ${hasAcceptedTerms ? 'bg-primary-300' : 'bg-primary-100'}`}
        >
          <Text className={`font-rubik-bold ${hasAcceptedTerms ? 'text-white' : 'text-black-200'}`}>
            Confirm Inspection
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

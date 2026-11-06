// AI-assisted: see docs/AI_LOG.md #27
// AI-assisted: see docs/AI_LOG.md #34
// AI-assisted: see docs/AI_LOG.md #36
// Vehicle tab: the 7 real fields of RF-06 (marca/modelo count as one for validity, F1 §2), backed by
// RegistrationFormContext. Same error-display rule as Datos personales (DP-08).

import { StyleSheet, Text, View } from 'react-native';
import { PlaceholderScreen } from '../../components/PlaceholderScreen';
import { PhotoField } from '../../components/registration/PhotoField';
import { SelectField } from '../../components/registration/SelectField';
import { TextField } from '../../components/registration/TextField';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { labels } from '../../constants/labels';
import { VEHICLE_CATEGORY_OPTIONS, VEHICLE_COLOR_OPTIONS } from '../../constants/registrationOptions';
import { useAppState } from '../../context/AppStateContext';
import { useRegistrationForm } from '../../context/RegistrationFormContext';
import { borderWidth, color, radius, space, type } from '../../theme/tokens';
import {
  isValidVehicleCategory,
  isValidPlate,
  isValidBrandOrModel,
  isValidVehicleYear,
  isValidVehicleColor,
  isValidCapacity,
  isNonEmptyUrl,
} from '../../utils/validators';

const SAFE_EDGES = ['top'];
const FIELDS = labels.registration.vehicle.fields;

export function VehicleScreen() {
  const { vehicle, setVehicleField, touchVehicleField, visitedTabs, isLocked } = useRegistrationForm();
  const { accountStatus } = useAppState();

  const showErrors = visitedTabs.vehicle;
  const isAccountPending = accountStatus === ACCOUNT_STATUS.PENDING;
  const errorFor = (key, isValid) =>
    !isValid && (vehicle.touched[key] || showErrors) ? FIELDS[key].error : null;

  return (
    <PlaceholderScreen name="vehicle" title={labels.tabs.vehicle} leading={null} safeEdges={SAFE_EDGES}>
      <View style={{ gap: space[5] }}>
        {isAccountPending ? (
          <Text testID="vehicle-pending-notice" style={styles.pendingNotice}>
            {labels.registration.pendingNotice}
          </Text>
        ) : null}

        <SelectField
          testID="vehicle-field-category"
          errorTestID="vehicle-error-category"
          label={FIELDS.category.label}
          options={VEHICLE_CATEGORY_OPTIONS}
          value={vehicle.category}
          onChange={(value) => {
            setVehicleField('category', value);
            touchVehicleField('category');
          }}
          errorMessage={errorFor('category', isValidVehicleCategory(vehicle.category))}
          disabled={isLocked}
        />

        <TextField
          testID="vehicle-field-plate"
          errorTestID="vehicle-error-plate"
          label={FIELDS.plate.label}
          value={vehicle.plate}
          onChangeText={(value) => setVehicleField('plate', value)}
          onBlur={() => touchVehicleField('plate')}
          maxLength={6}
          errorMessage={errorFor('plate', isValidPlate(vehicle.plate))}
          disabled={isLocked}
        />

        <TextField
          testID="vehicle-field-brand"
          errorTestID="vehicle-error-brand"
          label={FIELDS.brand.label}
          value={vehicle.brand}
          onChangeText={(value) => setVehicleField('brand', value)}
          onBlur={() => touchVehicleField('brand')}
          maxLength={30}
          errorMessage={errorFor('brand', isValidBrandOrModel(vehicle.brand))}
          disabled={isLocked}
        />

        <TextField
          testID="vehicle-field-model"
          errorTestID="vehicle-error-model"
          label={FIELDS.model.label}
          value={vehicle.model}
          onChangeText={(value) => setVehicleField('model', value)}
          onBlur={() => touchVehicleField('model')}
          maxLength={30}
          errorMessage={errorFor('model', isValidBrandOrModel(vehicle.model))}
          disabled={isLocked}
        />

        <TextField
          testID="vehicle-field-year"
          errorTestID="vehicle-error-year"
          label={FIELDS.year.label}
          value={vehicle.year}
          onChangeText={(value) => setVehicleField('year', value)}
          onBlur={() => touchVehicleField('year')}
          keyboardType="number-pad"
          maxLength={4}
          errorMessage={errorFor('year', isValidVehicleYear(vehicle.year))}
          disabled={isLocked}
        />

        <SelectField
          testID="vehicle-field-color"
          errorTestID="vehicle-error-color"
          label={FIELDS.color.label}
          options={VEHICLE_COLOR_OPTIONS}
          value={vehicle.color}
          onChange={(value) => {
            setVehicleField('color', value);
            touchVehicleField('color');
          }}
          errorMessage={errorFor('color', isValidVehicleColor(vehicle.color))}
          disabled={isLocked}
        />

        <TextField
          testID="vehicle-field-capacity"
          errorTestID="vehicle-error-capacity"
          label={FIELDS.capacity.label}
          value={vehicle.capacity}
          onChangeText={(value) => setVehicleField('capacity', value)}
          onBlur={() => touchVehicleField('capacity')}
          keyboardType="number-pad"
          errorMessage={errorFor('capacity', isValidCapacity(vehicle.capacity, vehicle.category))}
          disabled={isLocked}
        />

        <PhotoField
          testID="vehicle-field-photo"
          errorTestID="vehicle-error-photo"
          label={FIELDS.photoUrl.label}
          value={vehicle.photoUrl}
          onChange={(url) => setVehicleField('photoUrl', url)}
          errorMessage={errorFor('photoUrl', isNonEmptyUrl(vehicle.photoUrl))}
          disabled={isLocked}
        />
      </View>
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  pendingNotice: {
    ...type.label,
    color: color.warning,
    backgroundColor: color.bg,
    borderWidth: borderWidth.thin,
    borderColor: color.warning,
    borderRadius: radius.sm,
    padding: space[3],
  },
});

import type { TextVariant } from '../../theme';

type Props = {
  variant: TextVariant
};

export default function Text(props: Props) {
  const { variant } = props;
  console.log(variant);

  return null;
}

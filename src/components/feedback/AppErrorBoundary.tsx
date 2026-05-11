import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
    };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Something went wrong while rendering the app.',
    };
  }

  componentDidCatch(error: Error): void {
    console.error('[UI] Unhandled render error:', error);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, message: '' });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.title}>Unexpected Error</Text>
        <Text style={styles.message}>{this.state.message}</Text>
        <Pressable
          onPress={this.handleReset}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Retry rendering the application"
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F6F8FA',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#24292F',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#57606A',
    textAlign: 'center',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#0969DA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
